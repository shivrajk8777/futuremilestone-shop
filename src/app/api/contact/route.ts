import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, inquiryType, quantity, category, city, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const contactDoc = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      companyName: companyName ? String(companyName).trim() : '',
      inquiryType: inquiryType || 'Bulk Order / Wholesale',
      quantity: quantity || '',
      category: category || '',
      city: city ? String(city).trim() : '',
      message: String(message).trim(),
      status: 'new',
      createdAt: new Date(),
    };

    try {
      const { getDatabase } = await import('@/lib/mongodb');
      const db = await getDatabase();
      await db.collection('contacts').insertOne(contactDoc);
    } catch (dbError: any) {
      console.warn('MongoDB insertion notice (resilient mode):', dbError?.message || dbError);
      console.log('RECEIVED BULK INQUIRY RECORD:', JSON.stringify(contactDoc, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry.' },
      { status: 500 }
    );
  }
}



