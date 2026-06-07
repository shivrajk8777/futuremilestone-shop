import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();
    
    const product = await db.collection('products').findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const price = product.dimensions && product.dimensions[0] ? Number(product.dimensions[0].price) || 0 : 0;
    const dims = product.dimensions && product.dimensions[0] ? product.dimensions[0].label : 'Standard';

    const formatted = {
      id: product._id.toString(),
      slug: product.slug ?? '',
      name: product.name ?? '',
      price,
      category: product.collectionSlug ?? '',
      tagline: product.introText ?? '',
      description: product.description ?? '',
      features: Array.isArray(product.materials) ? product.materials.map((m: any) => m.name) : [],
      dimensions: dims,
      shippingReturns: 'Free shipping on orders over $500. Standard delivery takes 3-7 business days. Easy returns within 30 days of delivery.',
      images: Array.isArray(product.galleryImages) && product.galleryImages.length > 0
        ? [product.imageUrl, ...product.galleryImages].filter(Boolean)
        : (product.imageUrl ? [product.imageUrl] : []),
      materialsList: Array.isArray(product.materials) ? product.materials : [],
      dimensionsList: Array.isArray(product.dimensions) ? product.dimensions : [],
    };

    return NextResponse.json({ success: true, product: formatted });
  } catch (error: any) {
    console.error('Error fetching single product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
