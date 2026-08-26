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

    const rawShippingAddress = order.shippingAddress;
    let shippingAddress = null;
    if (rawShippingAddress) {
      if (typeof rawShippingAddress === 'string') {
        shippingAddress = {
          name: 'Customer',
          fullName: 'Customer',
          addressLine: rawShippingAddress,
          phone: '',
        };
      } else {
        const name = rawShippingAddress.fullName || rawShippingAddress.name || 'Customer';
        const phone = rawShippingAddress.phone || rawShippingAddress.contact || '';
        let addressLine = rawShippingAddress.addressLine;
        if (!addressLine) {
          const parts = [
            rawShippingAddress.flat,
            rawShippingAddress.area,
            rawShippingAddress.landmark ? (rawShippingAddress.landmark.toLowerCase().startsWith('near') ? rawShippingAddress.landmark : `Near ${rawShippingAddress.landmark}`) : '',
            rawShippingAddress.city,
            rawShippingAddress.state,
            rawShippingAddress.pincode && rawShippingAddress.country ? `${rawShippingAddress.pincode}, ${rawShippingAddress.country}` : (rawShippingAddress.pincode || rawShippingAddress.country),
          ].filter(Boolean);
          addressLine = parts.length > 0 ? parts.join(', ') : '';
        }
        shippingAddress = {
          ...rawShippingAddress,
          name,
          fullName: name,
          addressLine,
          phone,
        };
      }
    }

    const formattedOrder = {
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
      deliveryPartnerId: order.deliveryPartnerId || null,
      deliveryPartnerCode: order.deliveryPartnerCode || null,
      adminMessage: order.adminMessage || null,
      statusTimeline: order.statusTimeline || [],
      shippingAddress,
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
