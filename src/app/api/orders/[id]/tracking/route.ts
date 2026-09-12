import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { trackShipment } from "@/lib/tracking-providers";
import { sendEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
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
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const order = await db.collection("orders").findOne({
      _id: orderObjId,
      userId: userObjId,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.trackingId) {
      return NextResponse.json({
        success: true,
        tracking: null
      });
    }

    // Determine the dispatch time from status timeline
    const dispatchEntry = (order.statusTimeline || []).find(
      (t: any) => t.status === "Dispatched" || t.status === "Shipped"
    );
    const dispatchTime = dispatchEntry ? new Date(dispatchEntry.timestamp) : new Date(order.updatedAt || order.createdAt || Date.now());

    // Call tracking provider registry
    const partnerCode = order.deliveryPartnerCode || "";
    const trackingDetails = await trackShipment(partnerCode, order.trackingId, dispatchTime);

    // Auto-sync carrier status into database
    let syncedStatus = order.status;
    if (trackingDetails && trackingDetails.status) {
      const normalizedTracking = trackingDetails.status.trim();
      const isDelivered = normalizedTracking.toLowerCase() === "delivered";
      const isOutForDelivery = normalizedTracking.toLowerCase() === "out for delivery";

      const latestCheckpoint = trackingDetails.checkpoints?.[0];
      const checkpointTime = latestCheckpoint?.timestamp ? new Date(latestCheckpoint.timestamp) : new Date();

      if (isDelivered && order.status !== "Delivered") {
        syncedStatus = "Delivered";
        const timelineEntry = {
          status: "Delivered",
          timestamp: checkpointTime,
          comment: latestCheckpoint?.description || "Package delivered according to carrier tracking."
        };
        await db.collection("orders").updateOne(
          { _id: orderObjId },
          {
            $set: { status: "Delivered", updatedAt: new Date() },
            $push: { statusTimeline: timelineEntry } as any
          }
        );

        // Send delivery email if customer email is present
        if (order.customerEmail) {
          const orderNum = order.orderNumber || `#FM-${id.slice(-5).toUpperCase()}`;
          const customerName = order.customerName || order.shippingAddress?.fullName || order.shippingAddress?.name || "Customer";
          const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://futuremilestone.shop";
          const logoUrl = "https://res.cloudinary.com/dhkf4qmql/image/upload/futuremilestone/futuremilestone_logo.png";

          const itemsRows = Array.isArray(order.items) ? order.items.map((item: any) => {
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
            return `
              <tr style="border-bottom: 1px solid #ececec;">
                <td style="padding: 10px 8px; vertical-align: middle; width: 56px;">
                  <img src="${imgUrl}" alt="${item.name}" width="48" height="48" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #eeeeee; display: block;" />
                </td>
                <td style="padding: 10px 8px; vertical-align: middle; font-size: 13px; color: #0e1011;">
                  <div style="font-weight: 600;">${item.name}</div>
                  ${specs ? `<div style="font-size: 11px; color: #0e101180; margin-top: 2px;">${specs}</div>` : ""}
                </td>
                <td style="padding: 10px 8px; vertical-align: middle; text-align: center; font-size: 13px; color: #0e101199;">
                  Qty: ${qty}
                </td>
              </tr>
            `;
          }).join('') : '';

          await sendEmail({
            to: order.customerEmail,
            subject: `Order ${orderNum} Delivered!`,
            html: `
              <div style="font-family: 'DM Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #ececec; border-radius: 16px; background-color: #ffffff; color: #0e1011;">
                <div style="text-align: center; border-bottom: 1px solid #ececec; padding-bottom: 20px; margin-bottom: 25px;">
                  <img src="${logoUrl}" alt="Future Milestone" width="42" height="34" style="display: block; margin: 0 auto 10px auto; width: 42px; height: auto; border: 0;" />
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #0e1011;">futuremilestone</h2>
                </div>
                <h3 style="font-size: 18px; font-weight: 600; color: #0e1011;">Your Order Has Been Delivered!</h3>
                <p>Dear ${customerName},</p>
                <p>Great news! Your order <strong>${orderNum}</strong> has been successfully delivered by ${trackingDetails.carrier || "DHL Express"}.</p>
                
                ${itemsRows ? `
                <div style="margin: 20px 0; background-color: #fafafa; border: 1px solid #ececec; border-radius: 12px; padding: 14px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                      ${itemsRows}
                    </tbody>
                  </table>
                </div>
                ` : ''}

                <p>We hope you love your new furniture pieces. Thank you for choosing Futuremilestone!</p>
                <div style="border-top: 1px solid #ececec; margin-top: 25px; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
                  <p style="margin: 0;">This is an automated notification from Futuremilestone. Please do not reply directly to this email.</p>
                  <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Future Milestone. All rights reserved.</p>
                </div>
              </div>
            `,
            orderId: id
          }).catch(err => console.error("Auto-sync email error:", err));
        }
      } else if (isOutForDelivery && order.status !== "Delivered" && order.status !== "Out for Delivery") {
        syncedStatus = "Out for Delivery";
        const timelineEntry = {
          status: "Out for Delivery",
          timestamp: checkpointTime,
          comment: latestCheckpoint?.description || "Package is out for delivery with courier."
        };
        await db.collection("orders").updateOne(
          { _id: orderObjId },
          {
            $set: { status: "Out for Delivery", updatedAt: new Date() },
            $push: { statusTimeline: timelineEntry } as any
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      tracking: trackingDetails,
      syncedStatus
    });
  } catch (error: any) {
    console.error("Fetch tracking error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tracking details" },
      { status: 500 }
    );
  }
}
