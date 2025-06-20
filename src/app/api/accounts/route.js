import dbConnect from '@/lib/db';
import Account from '@/models/Account';
import ImapConfig from '@/models/ImapConfig';

export async function GET() {
  await dbConnect();
  try {
    const accounts = await Account.find({}).populate('imapConfig');
    return new Response(JSON.stringify(accounts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  await dbConnect();
  const { email, password, imapConfig } = await request.json();
  try {
    let configId;
    if (imapConfig) {
      const domain = email.split('@')[1];
      const updatedConfig = await ImapConfig.findOneAndUpdate(
        { domain },
        { ...imapConfig, domain },
        { new: true, upsert: true }
      );
      configId = updatedConfig._id;
    }

    const account = await Account.create({ email, password, imapConfig: configId });
    return new Response(JSON.stringify(account), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
