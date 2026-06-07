import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    let objId;
    try {
      objId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    const user = await usersCollection.findOne({ _id: objId });

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        savedAddresses: user.savedAddresses || [],
      },
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Session verification failed' },
      { status: 500 }
    );
  }
}
