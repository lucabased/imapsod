import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ImapConfig from '@/models/ImapConfig';

export async function GET() {
  await dbConnect();
  try {
    const configs = await ImapConfig.find({});
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch IMAP configs' }, { status: 500 });
  }
}
