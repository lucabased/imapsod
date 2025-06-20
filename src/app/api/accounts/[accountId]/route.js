import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Account from '@/models/Account';
import ImapConfig from '@/models/ImapConfig';

export async function PUT(request, { params }) {
    const { accountId } = params;
    const { email, password, imapConfig } = await request.json();

    await dbConnect();

    try {
        const account = await Account.findById(accountId);
        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const oldEmail = account.email;
        account.email = email;
        if (password) {
            account.password = password;
        }

        if (imapConfig) {
            const domain = email.split('@')[1];
            const updatedConfig = await ImapConfig.findOneAndUpdate(
                { _id: account.imapConfig },
                { ...imapConfig, domain },
                { new: true, upsert: true }
            );
            account.imapConfig = updatedConfig._id;
        }
        
        account.status = 'unknown'; // Reset status after editing
        await account.save();

        return NextResponse.json(account);
    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
