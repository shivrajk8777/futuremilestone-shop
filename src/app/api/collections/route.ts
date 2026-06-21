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
            order: 1,
            updatedAt: 1,
          },
        }
      )
      .toArray();

    const formatted = collections
      .map((item) => ({
        id: item._id.toString(),
        name: item.name ?? '',
        slug: item.slug ?? '',
        imageUrl: item.imageUrl ?? '',
        description: item.description ?? '',
        order: typeof item.order === 'number' ? item.order : null,
        updatedAt: item.updatedAt ?? item._id.getTimestamp(),
      }))
      .sort((a, b) => {
        const orderA = a.order !== null ? a.order : Infinity;
        const orderB = b.order !== null ? b.order : Infinity;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA;
      });

    return NextResponse.json({ success: true, collections: formatted });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
