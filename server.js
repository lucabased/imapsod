import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import dbConnect from './src/lib/db.js';
import Account from './src/models/Account.js';
import imaps from 'imap-simple';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function checkAccount(account) {
    if (!account.imapConfig) {
        return 'burned';
    }

    const config = {
        imap: {
            user: account.email,
            password: account.password,
            host: account.imapConfig.imap_server,
            port: account.imapConfig.imap_port,
            tls: account.imapConfig.imap_tls,
            authTimeout: 3000
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.end();
        return 'working';
    } catch (error) {
        return 'burned';
    }
}

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });

    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            if (message.toString() === 'check-all') {
                await dbConnect();
                const accounts = await Account.find({}).populate('imapConfig');
                let checkedCount = 0;

                for (const account of accounts) {
                    console.log(`Checking account: ${account.email}`);
                    const status = await checkAccount(account);
                    console.log(`Account ${account.email} status: ${status}`);
                    account.status = status;
                    await account.save();
                    checkedCount++;
                    ws.send(JSON.stringify({
                        type: 'log',
                        data: {
                            email: account.email,
                            status,
                            progress: (checkedCount / accounts.length) * 100,
                            message: `Checked account: ${account.email} - Status: ${status}`
                        }
                    }));
                }
                ws.send(JSON.stringify({ type: 'done' }));
            }
        });
    });
});
