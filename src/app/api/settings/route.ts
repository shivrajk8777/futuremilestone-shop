import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();
    const settings = await db.collection('settings').findOne({ _id: 'master_settings' as any });

    const result = {
      marqueeVisible: settings?.marqueeVisible ?? true,
      marqueeText: settings?.marqueeText ?? 'Save 20% on your first order',
      carouselVisible: settings?.carouselVisible ?? true,
      slides: settings?.slides || [],
    };

    return NextResponse.json({ success: true, settings: result });
  } catch (err: any) {
    console.error('Failed to fetch settings:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
