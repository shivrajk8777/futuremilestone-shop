import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function parseId(id: string) {
  try { return new ObjectId(id); } catch { return null; }
}

// ── GET /api/blogs/[id] — fetch single blog by id OR slug ─────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const objId = parseId(id);
    const blog = objId
      ? await db.collection('blogs').findOne({ _id: objId })
      : await db.collection('blogs').findOne({ slug: id });

    if (!blog) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
    }

    return NextResponse.json({
      success: true,
      blog: {
        id:       blog._id.toString(),
        slug:     blog.slug,
        title:    blog.title,
        summary:  blog.summary,
        content:  blog.content,
        image:    blog.image,
        category: blog.category || 'Design',
        readTime: blog.readTime || '5 min read',
        date:     blog.date,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// ── PUT /api/blogs/[id] — update a blog ───────────────────────────────────
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const objId = parseId(id);
    if (!objId) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400, headers: CORS_HEADERS });

    const body = await request.json();
    const { title, summary, content, image, category, readTime } = body;

    const db = await getDatabase();
    const now = new Date();

    await db.collection('blogs').updateOne(
      { _id: objId },
      {
        $set: {
          title:     title?.trim(),
          summary:   summary?.trim() || '',
          content:   content,
          image:     image || '',
          category:  category || 'Design',
          readTime:  readTime || '5 min read',
          updatedAt: now,
        },
      },
    );

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// ── DELETE /api/blogs/[id] — delete a blog ────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const objId = parseId(id);
    if (!objId) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400, headers: CORS_HEADERS });

    const db = await getDatabase();
    await db.collection('blogs').deleteOne({ _id: objId });

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
