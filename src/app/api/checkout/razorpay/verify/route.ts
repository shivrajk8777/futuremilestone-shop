import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

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
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      total,
      shippingAddress,
    } = await request.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification tokens' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: 'Server key secret missing' },
        { status: 500 }
      );
    }

    // Verify HMAC signature
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    let objId: ObjectId;
    try {
      objId = new ObjectId(userId);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid user session' },
        { status: 400 }
      );
    }

    // Save address to user's saved locations if requested
    if (shippingAddress && typeof shippingAddress === 'object' && shippingAddress.saveAddress) {
      const addressId = `addr_${Math.random().toString(36).slice(2, 10)}`;
      const savedAddr = {
        id: addressId,
        label: `Shipping - ${shippingAddress.city || 'Location'}`,
        fullName: shippingAddress.fullName || '',
        phone: shippingAddress.phone || '',
        flat: shippingAddress.flat || '',
        area: shippingAddress.area || '',
        landmark: shippingAddress.landmark || '',
        pincode: shippingAddress.pincode || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        country: shippingAddress.country || '',
        createdAt: new Date(),
      };

      await db.collection('users').updateOne(
        { _id: objId },
        {
          // @ts-ignore
          $push: { savedAddresses: savedAddr },
        }
      );
    }

    let cleanShippingAddress = null;
    if (shippingAddress) {
      if (typeof shippingAddress === 'object') {
        cleanShippingAddress = {
          fullName: shippingAddress.fullName || '',
          phone: shippingAddress.phone || '',
          flat: shippingAddress.flat || '',
          area: shippingAddress.area || '',
          landmark: shippingAddress.landmark || '',
          pincode: shippingAddress.pincode || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          country: shippingAddress.country || '',
        };
      } else {
        cleanShippingAddress = shippingAddress;
      }
    }

    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const orderNumber = `#FJ-${rand}`;

    const orderDoc = {
      userId: objId,
      orderNumber,
      items,
      total: Number(total) || 0,
      status: 'Processing',
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      shippingAddress: cleanShippingAddress,
      createdAt: new Date(),
      trackingId: null,
      deliveryPartnerName: null,
      adminMessage: null,
      statusTimeline: [
        {
          status: 'Processing',
          timestamp: new Date(),
          comment: 'Paid via Razorpay. Order placed successfully.',
        },
      ],
    };

    const result = await db.collection('orders').insertOne(orderDoc);

    // Send confirmation email
    try {
      const user = await db.collection('users').findOne({ _id: objId });
      if (user && user.email) {
        const itemsListHtml = items.map((item: any) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 8px; font-size: 14px; color: #334155;">
              <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
              ${item.material || item.dimension ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${[item.material, item.dimension].filter(Boolean).join(' • ')}</div>` : ''}
            </td>
            <td style="padding: 12px 8px; font-size: 14px; color: #334155; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; font-size: 14px; color: #334155; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
            <td style="padding: 12px 8px; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
          </tr>
        `).join('');

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Confirmation - ${orderNumber}</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-top: 0;">Order Confirmation ${orderNumber}</h2>
              <p>Hi ${user.name || 'Customer'}, thank you for your payment via Razorpay! Your order has been placed.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 10px;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                </tbody>
              </table>
              <h3 style="text-align: right; color: #0f172a; margin-top: 20px;">Total Paid: ₹${Number(total).toFixed(2)}</h3>
            </div>
          </body>
          </html>
        `;

        await sendEmail({
          to: user.email,
          subject: `Order Confirmation ${orderNumber}`,
          html: emailHtml,
          orderId: result.insertedId.toString(),
        });
      }
    } catch (emailErr) {
      console.error('Failed to send email confirmation:', emailErr);
    }

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
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
