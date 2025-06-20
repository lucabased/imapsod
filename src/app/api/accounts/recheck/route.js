import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Account from '@/models/Account';
import imaps from 'imap-simple';

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

export async function POST(request) {
    await dbConnect();
    const { accountId } = await request.json();
    try {
        const account = await Account.findById(accountId).populate('imapConfig');
        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }
        const status = await checkAccount(account);
        account.status = status;
        await account.save();
        return NextResponse.json({ email: account.email, status });
    } catch (error) {
        console.error('Error rechecking account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
