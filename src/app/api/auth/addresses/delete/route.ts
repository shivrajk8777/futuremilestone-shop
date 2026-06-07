import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { addressId } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    let objId;
    try {
      objId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid user session' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { _id: objId },
      {
        // @ts-ignore
        $pull: { savedAddresses: { id: addressId } }
      }
    );

    const user = await usersCollection.findOne({ _id: objId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
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
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete address' },
      { status: 500 }
    );
  }
}
