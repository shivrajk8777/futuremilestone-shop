import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const contactDoc = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: new Date(),
    };

    await db.collection('contacts').insertOne(contactDoc);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit contact query.' },
      { status: 500 }
    );
  }
}
