import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const emailNormalized = email.toLowerCase().trim();
    const db = await getDatabase();
    
    // 1. Verify the OTP is valid and matches
    const otpsCollection = db.collection('otps');
    const otpDoc = await otpsCollection.findOne({
      email: emailNormalized,
      otp: otp.trim(),
      type: 'reset_password',
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // 2. Find the user
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: emailNormalized });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 }
      );
    }

    // 3. Hash and update password
    const passwordHash = hashPassword(newPassword);
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    // 4. Delete the used OTP code
    await otpsCollection.deleteOne({ _id: otpDoc._id });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset.'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
