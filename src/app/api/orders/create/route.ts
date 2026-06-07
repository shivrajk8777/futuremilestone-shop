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

    const { items, total, shippingAddress } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    let objId;
    try {
      objId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid user session' },
        { status: 400 }
      );
    }

    // Generate random 5-character alphanumeric order number
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const orderNumber = `#FJ-${rand}`;

    const orderDoc = {
      userId: objId,
      orderNumber,
      items,
      total: Number(total) || 0,
      status: 'Processing',
      shippingAddress: shippingAddress || null,
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderDoc);

    return NextResponse.json({
      success: true,
      order: {
        id: result.insertedId.toString(),
        orderNumber,
        items,
        total: orderDoc.total,
        status: orderDoc.status,
        createdAt: orderDoc.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Order creation failed' },
      { status: 500 }
    );
  }
}
