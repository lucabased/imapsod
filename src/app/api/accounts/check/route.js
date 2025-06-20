import { NextResponse } from 'next/server';
import imaps from 'imap-simple';

export async function POST(request) {
    const { email, password, imapConfig } = await request.json();

    if (!email || !password || !imapConfig) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const config = {
        imap: {
            user: email,
            password: password,
            host: imapConfig.imap_server,
            port: imapConfig.imap_port,
            tls: imapConfig.imap_tls,
            authTimeout: 3000
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.end();
        return NextResponse.json({ message: 'Connection successful' });
    } catch (error) {
        console.error('IMAP connection error:', error);
        let errorMessage = 'IMAP connection failed';
        if (error.source === 'authentication') {
            errorMessage = 'Authentication failed. Please check your email and password.';
        } else if (error.message) {
            errorMessage = `IMAP connection failed: ${error.message}`;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
