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

    const formattedOrders = orders.map((order) => {
      const rawTotal = order.total;
      let currencySymbol = order.currencySymbol;
      let currency = order.currency;

      if (typeof rawTotal === 'string') {
        const symbolMatch = rawTotal.match(/^([₹$€£₨৳])/);
        if (symbolMatch && !currencySymbol) {
          currencySymbol = symbolMatch[1];
        }
      }

      if (!currencySymbol) {
        if (currency === 'INR') currencySymbol = '₹';
        else if (currency === 'EUR') currencySymbol = '€';
        else if (currency === 'GBP') currencySymbol = '£';
        else currencySymbol = '$';
      }

      if (!currency) {
        if (currencySymbol === '₹') currency = 'INR';
        else if (currencySymbol === '€') currency = 'EUR';
        else if (currencySymbol === '£') currency = 'GBP';
        else currency = 'USD';
      }

      let items = (order.items || []).map((item: any) => ({ ...item }));

      if (items.length > 0) {
        const baseSubtotal = items.reduce(
          (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );
        const cleanTotalNum =
          typeof rawTotal === 'number'
            ? rawTotal
            : Number(String(rawTotal).replace(/[^0-9.-]+/g, ''));

        if (baseSubtotal > 0 && !isNaN(cleanTotalNum) && cleanTotalNum > 0) {
          const ratio = cleanTotalNum / baseSubtotal;

          if (Math.abs(ratio - 1) > 0.15) {
            items = items.map((item: any) => ({
              ...item,
              price: Number(((Number(item.price) || 0) * ratio).toFixed(2)),
            }));
          }
        }
      }

      return {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        items,
        total: order.total,
        currency,
        currencySymbol,
        status: order.status || 'Processing',
        createdAt: order.createdAt,
        trackingId: order.trackingId || null,
        deliveryPartnerName: order.deliveryPartnerName || null,
        adminMessage: order.adminMessage || null,
        statusTimeline: order.statusTimeline || [],
      };
    });

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
