import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import Account from '../../../../../models/Account';
import Tag from '../../../../../models/Tag';

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const { accountId } = await params;
    const { tagId } = await request.json();

    const account = await Account.findById(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    if (account.tags.includes(tagId)) {
      return NextResponse.json({ error: 'Tag already assigned' }, { status: 400 });
    }

    account.tags.push(tagId);
    await account.save();

    const populatedAccount = await Account.findById(accountId).populate('tags');
    return NextResponse.json(populatedAccount, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign tag' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    try {
      const { accountId } = await params;
      const { tagId } = await request.json();
  
      const account = await Account.findById(accountId);
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
  
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }
  
      account.tags.pull(tagId);
      await account.save();
  
      const populatedAccount = await Account.findById(accountId).populate('tags');
      return NextResponse.json(populatedAccount, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to unassign tag' }, { status: 500 });
    }
}
