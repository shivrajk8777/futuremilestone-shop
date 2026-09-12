import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { sendEmail, ADMIN_EMAILS } from '@/lib/email';
import { generateOrderNumber } from '@/lib/orderNumber';

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
          $push: { savedAddresses: savedAddr }
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

    const orderNumber = await generateOrderNumber(db);

    const orderDoc = {
      userId: objId,
      orderNumber,
      items,
      total: Number(total) || 0,
      status: 'Processing',
      shippingAddress: cleanShippingAddress,
      createdAt: new Date(),
      trackingId: null,
      deliveryPartnerName: null,
      adminMessage: null,
      statusTimeline: [
        {
          status: 'Processing',
          timestamp: new Date(),
          comment: 'Order placed successfully.'
        }
      ]
    };

    const result = await db.collection('orders').insertOne(orderDoc);

    // Attempt to send email confirmation to the user
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
            <style>
              body {
                font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                border: 1px solid #ececec;
              }
              .header {
                padding: 28px 24px 20px 24px;
                text-align: center;
                border-bottom: 1px solid #ececec;
              }
              .header h1 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: -0.02em;
                color: #0e1011;
              }
              .content {
                padding: 28px 24px;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #0f172a;
                margin-top: 0;
                margin-bottom: 12px;
              }
              .intro {
                font-size: 14px;
                color: #475569;
                line-height: 1.6;
                margin-top: 0;
                margin-bottom: 24px;
              }
              .order-details-box {
                background-color: #fafafa;
                border: 1px solid #ececec;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 24px;
              }
              .items-table th {
                background-color: #fafafa;
                border-bottom: 1.5px solid #ececec;
                padding: 10px 8px;
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .total-section {
                border-top: 2px solid #ececec;
                padding-top: 16px;
                text-align: right;
              }
              .total-label {
                font-size: 14px;
                color: #475569;
                margin-right: 16px;
                font-weight: 600;
              }
              .total-amount {
                font-size: 18px;
                font-weight: 700;
                color: #0e1011;
              }
              .footer {
                background-color: #fafafa;
                padding: 20px 24px;
                text-align: center;
                border-top: 1px solid #ececec;
                font-size: 11px;
                color: #94a3b8;
              }
              .footer p {
                margin: 4px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logoUrl}" alt="Future Milestone" width="42" height="34" style="display: block; margin: 0 auto 10px auto; width: 42px; height: auto; border: 0;" />
                <h1>futuremilestone</h1>
              </div>
              <div class="content">
                <h2 class="greeting">Hi ${user.name || 'Customer'},</h2>
                <p class="intro">
                  Thank you for shopping with us! We have received your order and are currently processing it. Here are your order details:
                </p>
                
                <div class="order-details-box">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Order Number:</td>
                      <td style="font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; padding-bottom: 8px;">${orderNumber}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #64748b;">Order Date:</td>
                      <td style="font-size: 13px; font-weight: 600; color: #0f172a; text-align: right;">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    </tr>
                  </table>
                </div>

                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;" colspan="2">Product</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsListHtml}
                  </tbody>
                </table>

                <div class="total-section">
                  <span class="total-label">Grand Total:</span>
                  <span class="total-amount">₹${Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div class="footer">
                <p>If you have any questions, contact us at info@futuremilestone.shop</p>
                <p>&copy; ${new Date().getFullYear()} Future Milestone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send confirmation email to customer
        await sendEmail({
          to: user.email,
          subject: `Your Order Confirmation ${orderNumber}`,
          html: emailHtml,
          orderId: result.insertedId.toString(),
        });

        // Send new order alert to admins
        await sendEmail({
          to: ADMIN_EMAILS,
          subject: `[New Order Alert] Order #${orderNumber} received`,
          html: emailHtml,
          orderId: result.insertedId.toString(),
        });
      }
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr);
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
        trackingId: null,
        deliveryPartnerName: null,
        adminMessage: null,
        statusTimeline: orderDoc.statusTimeline,
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
