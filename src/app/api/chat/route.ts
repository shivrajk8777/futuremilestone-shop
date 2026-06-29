import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const peek = searchParams.get('peek') === 'true';

    let objId;
    try {
      objId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid session user ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const messagesCollection = db.collection('chat_messages');

    // Fetch all messages for this user
    const messages = await messagesCollection
      .find({ userId: userId })
      .sort({ timestamp: 1 })
      .toArray();

    // Mark admin messages as read by the user unless we are just peeking
    if (!peek) {
      await messagesCollection.updateMany(
        { userId: userId, sender: 'admin', readByUser: false },
        { $set: { readByUser: true } }
      );
    }

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        userId: msg.userId,
        userName: msg.userName,
        userEmail: msg.userEmail,
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.timestamp,
        readByAdmin: msg.readByAdmin,
        readByUser: peek ? msg.readByUser : true,
      })),
    });
  } catch (error: any) {
    console.error('Chat GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

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

    const { message } = await request.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    let objId;
    try {
      objId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid session user ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: objId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const messagesCollection = db.collection('chat_messages');
    const newMessage = {
      userId: userId,
      userName: user.name || 'Customer',
      userEmail: user.email,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      readByAdmin: false,
      readByUser: true,
    };

    const result = await messagesCollection.insertOne(newMessage);

    return NextResponse.json({
      success: true,
      message: {
        id: result.insertedId.toString(),
        ...newMessage,
      },
    });
  } catch (error: any) {
    console.error('Chat POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
