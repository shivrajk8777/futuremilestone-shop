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
    try {
      userObjId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Build flexible query matching by _id or orderNumber (e.g. #FJ-10001, FJ-10001, or Mongo ObjectId)
    const cleanNumber = id.startsWith('#') ? id : `#${id}`;
    const queryConditions: any[] = [
      { orderNumber: cleanNumber },
      { orderNumber: id },
    ];

    if (ObjectId.isValid(id)) {
      queryConditions.push({ _id: new ObjectId(id) });
    }

    const order = await db.collection('orders').findOne({
      userId: userObjId,
      $or: queryConditions,
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
