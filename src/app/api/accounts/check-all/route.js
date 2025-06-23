import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Account from '@/models/Account';
import ImapConfig from '@/models/ImapConfig';
import imaps from 'imap-simple';

async function findImapConfig(email) {
    const domain = email.split('@')[1];
    const imapConfig = await ImapConfig.findOne({ domains: domain });
    return imapConfig;
}

async function checkAccount(account) {
    if (!account.imapConfig) {
        const imapConfig = await findImapConfig(account.email);
        if (imapConfig) {
            account.imapConfig = imapConfig;
        } else {
            return 'burned';
        }
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

export async function POST() {
    try {
        await dbConnect();
        const accounts = await Account.find({}).populate('imapConfig');
        
        const checkPromises = accounts.map(async (account) => {
            console.log(`Checking account: ${account.email}`);
            const status = await checkAccount(account);
            account.status = status;
            await account.save();

            if (global.wss) {
                const message = JSON.stringify({
                    type: 'account-status',
                    payload: {
                        id: account._id,
                        status: account.status,
                    },
                });
                global.wss.clients.forEach((client) => {
                    if (client.readyState === 1) { // 1 for WebSocket.OPEN
                        client.send(message);
                    }
                });
            }
        });

        await Promise.all(checkPromises);
        
        return NextResponse.json({ message: 'All accounts checked' }, { status: 200 });
    } catch (error) {
        console.error('Error checking all accounts:', error);
        return NextResponse.json({ error: 'Failed to check all accounts' }, { status: 500 });
    }
}
