import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getActiveDiscounts, applyDiscountsToProduct } from '@/lib/discounts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    if (!query) {
      return NextResponse.json({ success: true, products: [] });
    }

    const db = await getDatabase();

    // Try MongoDB $text search first (works if a text index exists on the collection).
    // Falls back to a regex-based search so it works even without an index.
    let products: any[] = [];

    try {
      products = await db
        .collection('products')
        .find({ $text: { $search: query } }, { projection: { score: { $meta: 'textScore' } } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .toArray();
    } catch {
      // $text search failed (no text index) — fall back to case-insensitive regex
      products = [];
    }

    // Fallback: regex search across name, introText, collectionSlug, description
    if (products.length === 0) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      products = await db
        .collection('products')
        .find({
          $or: [
            { name: { $regex: regex } },
            { introText: { $regex: regex } },
            { collectionSlug: { $regex: regex } },
            { description: { $regex: regex } },
          ],
        })
        .limit(limit)
        .toArray();
    }

    const activeDiscounts = await getActiveDiscounts();

    // Map to the frontend shape
    const formatted = products.map((item) => {
      const basePrice =
        item.dimensions && item.dimensions[0]
          ? Number(item.dimensions[0].price) || 0
          : 0;

      const rawProduct = {
        id: item._id.toString(),
        collectionId: item.collectionId,
        price: basePrice,
        dimensionsList: item.dimensions || [],
      };

      const discounted = applyDiscountsToProduct(rawProduct, activeDiscounts);

      return {
        id: item._id.toString(),
        slug: item.slug ?? '',
        name: item.name ?? '',
        price: discounted.price,
        originalPrice: discounted.originalPrice,
        discountBadge: discounted.discountBadge,
        discount: discounted.discount,
        category: item.collectionSlug ?? '',
        tagline: item.introText ?? '',
        images:
          Array.isArray(item.galleryImages) && item.galleryImages.length > 0
            ? [item.imageUrl, ...item.galleryImages].filter(Boolean)
            : item.imageUrl
            ? [item.imageUrl]
            : [],
      };
    });

    return NextResponse.json({ success: true, products: formatted });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
