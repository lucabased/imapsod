import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Tag from '../../../../models/Tag';
import Account from '../../../../models/Account';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const { tagId } = params;
    await Account.updateMany({ tags: tagId }, { $pull: { tags: tagId } });
    await Tag.findByIdAndDelete(tagId);
    return NextResponse.json({ message: 'Tag deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
