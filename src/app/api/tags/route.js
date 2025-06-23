import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Tag from '../../../models/Tag';
import Account from '../../../models/Account';

export async function GET() {
  await dbConnect();
  try {
    const tags = await Tag.find({});
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const { name, color } = await request.json();
    const newTag = new Tag({ name, color });
    await newTag.save();
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
