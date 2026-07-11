import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { success: false, error: 'Email and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'signup' && type !== 'reset_password') {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP type' },
        { status: 400 }
      );
    }

    const emailNormalized = email.toLowerCase().trim();
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const otpsCollection = db.collection('otps');

    // Check user existence based on request type
    const user = await usersCollection.findOne({ email: emailNormalized });

    if (type === 'signup' && user) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    if (type === 'reset_password' && !user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clear any previous OTPs of this type for this email
    await otpsCollection.deleteMany({ email: emailNormalized, type });

    // Store new OTP
    await otpsCollection.insertOne({
      email: emailNormalized,
      otp,
      type,
      expiresAt,
      createdAt: new Date(),
    });

    // Create a beautiful, premium email template
    const subject = type === 'signup' 
      ? 'Verify your email address - Future Milestone' 
      : 'Reset your password - Future Milestone';

    const actionText = type === 'signup'
      ? 'verify your email address and complete your signup'
      : 'reset your password';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 32px 24px;
            line-height: 1.6;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 12px;
          }
          .intro {
            font-size: 15px;
            color: #475569;
            margin-bottom: 24px;
          }
          .otp-box {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #6366f1;
            margin: 0;
            font-family: monospace;
          }
          .expiry-note {
            font-size: 13px;
            color: #94a3b8;
            margin-top: 12px;
            margin-bottom: 0;
          }
          .help-note {
            font-size: 14px;
            color: #64748b;
            margin-top: 24px;
            margin-bottom: 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
          .footer p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Future Milestone</h1>
          </div>
          <div class="content">
            <h2 class="greeting">Hello,</h2>
            <p class="intro">
              You requested a verification code to ${actionText}. Use the security code below to proceed:
            </p>
            
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
              <p class="expiry-note">This code is valid for 10 minutes and can only be used once.</p>
            </div>

            <p class="help-note">
              If you didn't request this code, please ignore this email or contact support if you have security concerns.
            </p>
          </div>
          <div class="footer">
            <p>If you have any questions, contact us at info@futuremilestone.shop</p>
            <p>&copy; ${new Date().getFullYear()} Future Milestone. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: emailNormalized,
      subject,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error: any) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
