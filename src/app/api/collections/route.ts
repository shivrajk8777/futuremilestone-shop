import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const collections = await db
      .collection('collections')
      .find(
        {},
        {
          projection: {
            name: 1,
            slug: 1,
            imageUrl: 1,
            description: 1,
            updatedAt: 1,
          },
        }
      )
      .sort({ updatedAt: -1, _id: -1 })
      .toArray();

    const formatted = collections.map((item) => ({
      id: item._id.toString(),
      name: item.name ?? '',
      slug: item.slug ?? '',
      imageUrl: item.imageUrl ?? '',
      description: item.description ?? '',
    }));

    return NextResponse.json({ success: true, collections: formatted });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
