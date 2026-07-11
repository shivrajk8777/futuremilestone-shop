import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, otp } = await request.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and verification code are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const emailNormalized = email.toLowerCase().trim();

    // Verify OTP
    const otpsCollection = db.collection('otps');
    const otpDoc = await otpsCollection.findOne({
      email: emailNormalized,
      otp: otp.trim(),
      type: 'signup',
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: emailNormalized });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const result = await usersCollection.insertOne({
      name,
      email: emailNormalized,
      passwordHash,
      createdAt: new Date(),
    });

    // Delete the used OTP code
    await otpsCollection.deleteOne({ _id: otpDoc._id });

    const userId = result.insertedId.toString();

    // Set secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('session_user', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name,
        email: emailNormalized,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
