import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { sendEmail, ADMIN_EMAILS } from '@/lib/email';

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

    // Generate random 5-character alphanumeric order number
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const orderNumber = `#FJ-${rand}`;

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
        const itemsListHtml = items.map((item: any) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 8px; font-size: 14px; color: #334155;">
              <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
              ${item.material || item.dimension ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${[item.material, item.dimension].filter(Boolean).join(' • ')}</div>` : ''}
            </td>
            <td style="padding: 12px 8px; font-size: 14px; color: #334155; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; font-size: 14px; color: #334155; text-align: right;">$${Number(item.price).toFixed(2)}</td>
            <td style="padding: 12px 8px; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600;">$${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
          </tr>
        `).join('');

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Order Confirmation - ${orderNumber}</title>
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
                border: 1px solid #e2e8f0;
              }
              .header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                padding: 32px 24px;
                text-align: center;
                color: #ffffff;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.025em;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #0f172a;
                margin-top: 0;
                margin-bottom: 12px;
              }
              .intro {
                font-size: 15px;
                color: #475569;
                line-height: 1.6;
                margin-top: 0;
                margin-bottom: 24px;
              }
              .order-details-box {
                background-color: #f1f5f9;
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
                background-color: #f8fafc;
                border-bottom: 2px solid #e2e8f0;
                padding: 10px 8px;
                font-size: 12px;
                font-weight: 700;
                color: #475569;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .total-section {
                border-top: 2px solid #e2e8f0;
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
                font-size: 20px;
                font-weight: 700;
                color: #6366f1;
              }
              .footer {
                background-color: #f8fafc;
                padding: 24px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
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
                <h1>Future Milestone</h1>
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
                      <th style="text-align: left;">Product</th>
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
                  <span class="total-amount">$${Number(total).toFixed(2)}</span>
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
