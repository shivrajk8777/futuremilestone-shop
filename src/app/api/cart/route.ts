import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

// GET /api/cart — fetch the logged-in user's saved cart
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    let objId: ObjectId;
    try {
      objId = new ObjectId(userId);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const db = await getDatabase();
    const cartsCollection = db.collection('carts');

    const cartDoc = await cartsCollection.findOne({ userId: objId });

    return NextResponse.json({
      success: true,
      cart: cartDoc?.items ?? [],
    });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart — save/replace the logged-in user's cart
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    let objId: ObjectId;
    try {
      objId = new ObjectId(userId);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const items = body.cart ?? [];

    const db = await getDatabase();
    const cartsCollection = db.collection('carts');

    await cartsCollection.updateOne(
      { userId: objId },
      {
        $set: {
          userId: objId,
          items,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart — clear the logged-in user's cart
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    let objId: ObjectId;
    try {
      objId = new ObjectId(userId);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const db = await getDatabase();
    const cartsCollection = db.collection('carts');

    await cartsCollection.deleteOne({ userId: objId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
