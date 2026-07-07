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

    return NextResponse.json({
      success: true,
      tracking: trackingDetails
    });
  } catch (error: any) {
    console.error("Fetch tracking error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tracking details" },
      { status: 500 }
    );
  }
}
