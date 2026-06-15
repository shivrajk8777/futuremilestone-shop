import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getActiveDiscounts, applyDiscountsToProduct } from '@/lib/discounts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const db = await getDatabase();
    
    // Build query filter
    const filter: Record<string, any> = {};
    if (category && category !== 'all') {
      filter.collectionSlug = category;
    }

    const skip = (page - 1) * limit;

    const products = await db
      .collection('products')
      .find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const activeDiscounts = await getActiveDiscounts();

    // Map database fields to the frontend Product shape
    const formatted = products.map((item) => {
      const basePrice = item.dimensions && item.dimensions[0] ? Number(item.dimensions[0].price) || 0 : 0;
      const dims = item.dimensions && item.dimensions[0] ? item.dimensions[0].label : 'Standard';
      
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
        description: item.description ?? '',
        features: Array.isArray(item.materials) ? item.materials.map((m: any) => m.name) : [],
        dimensions: dims,
        shippingReturns: 'Free shipping on orders over $500. Standard delivery takes 3-7 business days. Easy returns within 30 days of delivery.',
        images: Array.isArray(item.galleryImages) && item.galleryImages.length > 0
          ? [item.imageUrl, ...item.galleryImages].filter(Boolean)
          : (item.imageUrl ? [item.imageUrl] : []),
      };
    });

    return NextResponse.json({
      success: true,
      products: formatted,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
