import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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
    const orders = await db
      .collection('orders')
      .find({ userId: objId })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      items: order.items || [],
      total: order.total,
      status: order.status || 'Processing',
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
