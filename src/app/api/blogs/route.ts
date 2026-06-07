import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ── OPTIONS — CORS preflight ───────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── GET /api/blogs — list all published blogs ──────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',  10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip  = (page - 1) * limit;

    const db = await getDatabase();
    const blogs = await db
      .collection('blogs')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formatted = blogs.map((b) => ({
      id:       b._id.toString(),
      slug:     b.slug      ?? '',
      title:    b.title     ?? '',
      summary:  b.summary   ?? '',
      content:  b.content   ?? '',
      image:    b.image     ?? '',
      category: b.category  ?? 'Design',
      readTime: b.readTime  ?? '5 min read',
      date:     b.date      ?? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      createdAt: b.createdAt,
    }));

    return NextResponse.json({ success: true, blogs: formatted, page, limit }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Blogs GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// ── POST /api/blogs — create a new blog ───────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, content, image, category, readTime } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required.' }, { status: 400, headers: CORS_HEADERS });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const db = await getDatabase();

    // Ensure slug is unique
    const existing = await db.collection('blogs').findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const now = new Date();
    const doc = {
      slug:      finalSlug,
      title:     title.trim(),
      summary:   summary?.trim() || '',
      content:   content,
      image:     image || '',
      category:  category || 'Design',
      readTime:  readTime || '5 min read',
      date:      now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('blogs').insertOne(doc);

    return NextResponse.json({
      success: true,
      blog: { id: result.insertedId.toString(), ...doc },
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Blogs POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
