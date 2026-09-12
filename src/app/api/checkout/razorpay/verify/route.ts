import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { sendEmail, ADMIN_EMAILS } from '@/lib/email';
import { generateOrderNumber } from '@/lib/orderNumber';
import crypto from 'crypto';
import { getRazorpayKeys } from '@/lib/razorpayKeys';

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
      currency,
      currencySymbol,
      shippingAddress,
    } = await request.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification tokens' },
        { status: 400 }
      );
    }

    const { keySecret } = getRazorpayKeys();
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
        const name = shippingAddress.fullName || shippingAddress.name || '';
        const parts = [
          shippingAddress.flat,
          shippingAddress.area,
          shippingAddress.landmark ? (shippingAddress.landmark.toLowerCase().startsWith('near') ? shippingAddress.landmark : `Near ${shippingAddress.landmark}`) : '',
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.pincode && shippingAddress.country ? `${shippingAddress.pincode}, ${shippingAddress.country}` : (shippingAddress.pincode || shippingAddress.country),
        ].filter(Boolean);
        const addressLine = shippingAddress.addressLine || (parts.length > 0 ? parts.join(', ') : '');

        cleanShippingAddress = {
          name,
          fullName: name,
          phone: shippingAddress.phone || '',
          flat: shippingAddress.flat || '',
          area: shippingAddress.area || '',
          landmark: shippingAddress.landmark || '',
          pincode: shippingAddress.pincode || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          country: shippingAddress.country || '',
          addressLine,
        };
      } else {
        cleanShippingAddress = shippingAddress;
      }
    }

    const orderNumber = await generateOrderNumber(db);

    const orderDoc = {
      userId: objId,
      orderNumber,
      items,
      total: total || '',
      currency: currency || 'USD',
      currencySymbol: currencySymbol || '$',
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
        const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://futuremilestone.shop";
        const logoUrl = "https://res.cloudinary.com/dhkf4qmql/image/upload/futuremilestone/futuremilestone_logo.png";

        const itemsListHtml = items.map((item: any) => {
          const rawImg = item.image || item.imageUrl || item.thumbnail;
          let imgUrl = logoUrl;
          if (rawImg) {
            if (rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
              imgUrl = rawImg;
            } else {
              imgUrl = `${storeUrl.replace(/\/$/, "")}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;
            }
          }

          const specs = [item.material, item.dimension, item.selectedVariant].filter(Boolean).join(" • ");
          const qty = item.quantity || 1;
          const priceVal = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
          const lineTotal = priceVal * qty;

          return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; vertical-align: middle; width: 64px;">
                <img src="${imgUrl}" alt="${item.name}" width="56" height="56" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; display: block;" />
              </td>
              <td style="padding: 12px 8px; vertical-align: middle; font-size: 14px; color: #334155;">
                <div style="font-weight: 600; color: #0f172a; font-size: 14px; line-height: 1.3;">${item.name}</div>
                ${specs ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px; line-height: 1.3;">${specs}</div>` : ""}
              </td>
              <td style="padding: 12px 8px; vertical-align: middle; font-size: 14px; color: #334155; text-align: center;">${qty}</td>
              <td style="padding: 12px 8px; vertical-align: middle; font-size: 14px; color: #334155; text-align: right; white-space: nowrap;">₹${priceVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="padding: 12px 8px; vertical-align: middle; font-size: 14px; color: #0f172a; text-align: right; font-weight: 700; white-space: nowrap;">₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `;
        }).join('');

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Confirmation - ${orderNumber}</title>
          </head>
          <body style="font-family: 'DM Sans', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 16px; border: 1px solid #ececec;">
              <div style="text-align: center; border-bottom: 1px solid #ececec; padding-bottom: 20px; margin-bottom: 25px;">
                <img src="${logoUrl}" alt="Future Milestone" width="42" height="34" style="display: block; margin: 0 auto 10px auto; width: 42px; height: auto; border: 0;" />
                <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #0e1011;">futuremilestone</h2>
              </div>
              <h3 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 600;">Order Confirmation ${orderNumber}</h3>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hi ${user.name || 'Customer'}, thank you for your payment via Razorpay! Your order has been placed successfully.</p>
              
              <div style="margin: 20px 0; background-color: #fafafa; border: 1px solid #ececec; border-radius: 12px; padding: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1.5px solid #ececec; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
                      <th style="padding: 0 8px 8px 8px;" colspan="2">Item</th>
                      <th style="padding: 0 8px 8px 8px; text-align: center;">Qty</th>
                      <th style="padding: 0 8px 8px 8px; text-align: right;">Price</th>
                      <th style="padding: 0 8px 8px 8px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsListHtml}
                  </tbody>
                </table>
              </div>
              <h3 style="text-align: right; color: #0f172a; margin-top: 20px; font-size: 16px;">Total Paid: ₹${Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <div style="border-top: 1px solid #ececec; margin-top: 25px; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
                <p style="margin: 0;">This is an automated notification from Futuremilestone. Please do not reply directly to this email.</p>
                <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Future Milestone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send customer confirmation
        await sendEmail({
          to: user.email,
          subject: `Order Confirmation ${orderNumber}`,
          html: emailHtml,
          orderId: result.insertedId.toString(),
        });

        // Send admin notification
        await sendEmail({
          to: ADMIN_EMAILS,
          subject: `[New Razorpay Order] Order #${orderNumber} received`,
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
