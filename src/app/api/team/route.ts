import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const team = await db
      .collection('team')
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    const formatted = team.map((member) => ({
      id: member._id.toString(),
      name: member.name || '',
      role: member.role || '',
      image: member.image || '',
      socials: member.socials || { twitter: '#', instagram: '#', facebook: '#' },
    }));

    return NextResponse.json({ success: true, team: formatted });
  } catch (error: any) {
    console.error('Team GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch team members.' },
      { status: 500 }
    );
  }
}
