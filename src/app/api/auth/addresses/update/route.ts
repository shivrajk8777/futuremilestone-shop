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

    const {
      addressId,
      label,
      fullName,
      phone,
      flat,
      area,
      landmark,
      pincode,
      city,
      state,
      country
    } = await request.json();

    if (!addressId || !label || !fullName || !phone || !flat || !area || !pincode || !city || !state || !country) {
      return NextResponse.json(
        { success: false, error: 'Address ID and all fields except landmark are required' },
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

    const updatedAddress = {
      id: addressId,
      label: label.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      flat: flat.trim(),
      area: area.trim(),
      landmark: landmark ? landmark.trim() : '',
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      updatedAt: new Date(),
    };

    await usersCollection.updateOne(
      { _id: objId, 'savedAddresses.id': addressId },
      {
        // @ts-ignore
        $set: { 'savedAddresses.$': updatedAddress }
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
    console.error('Update address error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update address' },
      { status: 500 }
    );
  }
}
