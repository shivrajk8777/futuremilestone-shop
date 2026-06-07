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

    const { label, name, addressLine, phone } = await request.json();

    if (!label || !name || !addressLine) {
      return NextResponse.json(
        { success: false, error: 'Label, name, and address details are required' },
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

    const addressId = `addr_${Math.random().toString(36).slice(2, 10)}`;
    const newAddress = {
      id: addressId,
      label: label.trim(),
      name: name.trim(),
      addressLine: addressLine.trim(),
      phone: phone ? phone.trim() : '',
      createdAt: new Date(),
    };

    await usersCollection.updateOne(
      { _id: objId },
      {
        // @ts-ignore
        $push: { savedAddresses: newAddress }
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
    console.error('Add address error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add address' },
      { status: 500 }
    );
  }
}
