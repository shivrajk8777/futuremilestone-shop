import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { trackShipment } from "@/lib/tracking-providers";

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
          await sendEmail({
            to: order.customerEmail,
            subject: `Order ${orderNum} Delivered!`,
            html: `
              <div style="font-family: 'DM Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #ececec; border-radius: 16px; background-color: #ffffff; color: #0e1011;">
                <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0e1011;">futuremilestone</h2>
                <h3 style="font-size: 18px; font-weight: 600; color: #0e1011;">Your Order Has Been Delivered!</h3>
                <p>Dear ${customerName},</p>
                <p>Great news! Your order <strong>${orderNum}</strong> has been successfully delivered by ${trackingDetails.carrier || "DHL Express"}.</p>
                <p>We hope you love your new furniture pieces. Thank you for choosing Futuremilestone!</p>
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
