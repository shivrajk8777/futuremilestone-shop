import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userObjId;
    let orderObjId;
    try {
      userObjId = new ObjectId(userId);
      orderObjId = new ObjectId(id);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const order = await db.collection('orders').findOne({
      _id: orderObjId,
      userId: userObjId,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      items: order.items || [],
      total: order.total,
      status: order.status || 'Processing',
      createdAt: order.createdAt,
      trackingId: order.trackingId || null,
      deliveryPartnerName: order.deliveryPartnerName || null,
      deliveryPartnerId: order.deliveryPartnerId || null,
      deliveryPartnerCode: order.deliveryPartnerCode || null,
      adminMessage: order.adminMessage || null,
      statusTimeline: order.statusTimeline || [],
      shippingAddress: order.shippingAddress || null,
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
