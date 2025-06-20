import dbConnect from '@/lib/db';
import Account from '@/models/Account';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  let config; // Define config here

  try {
    const account = await Account.findById(accountId).populate('imapConfig');
    if (!account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!account.imapConfig) {
        return new Response(JSON.stringify({ error: 'IMAP configuration not found for this account' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    config = { // Assign value to config here
      imap: {
        user: account.email,
        password: account.password,
        host: account.imapConfig.imap_server,
        port: account.imapConfig.imap_port,
        tls: account.imapConfig.imap_tls,
        authTimeout: 3000,
        tlsOptions: {
          rejectUnauthorized: false,
        },
      },
    };

    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');
    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = await Promise.all(
      messages.map(async (item) => {
        const all = item.parts.find((part) => part.which === '');
        const mail = await simpleParser(all.body);
        const loginLink = (mail.text || '').match(/https:\/\/[^\s"]+/);
        return {
          id: item.attributes.uid,
          from: mail.from ? mail.from.text : 'No sender',
          subject: mail.subject,
          text: mail.text || '',
          html: mail.html || '',
          date: mail.date,
          loginLink: loginLink ? loginLink[0] : null,
        };
      })
    );
    connection.end();
    return new Response(JSON.stringify(emails), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    const errorResponse = {
      message: error.message,
      code: error.code,
      source: error.source,
    };
    if (error.source === 'authentication') {
      errorResponse.config = config.imap;
      delete errorResponse.config.password; // Do not expose password
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
