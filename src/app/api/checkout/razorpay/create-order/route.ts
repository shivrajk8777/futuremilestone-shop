import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { cookies } from 'next/headers';
import { getRazorpayKeys } from '@/lib/razorpayKeys';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency, inrAmount } = await request.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    const { keyId, keySecret } = getRazorpayKeys();

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing check:', { keyIdExists: !!keyId, keySecretExists: !!keySecret });
      return NextResponse.json(
        { success: false, error: 'Razorpay keys not configured on server' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const targetCurrency = (currency || 'INR').toUpperCase();
    const receipt = `rcpt_${Math.random().toString(36).slice(2, 10)}`;

    let razorpayOrder: any;

    if (targetCurrency !== 'INR') {
      try {
        const amountInSubunits = Math.round(Number(amount) * 100);
        razorpayOrder = await razorpay.orders.create({
          amount: amountInSubunits,
          currency: targetCurrency,
          receipt,
          notes: { userId },
        });
      } catch (err: any) {
        console.warn(`Razorpay order creation with ${targetCurrency} failed, falling back to INR:`, err?.message || err);
        const fallbackInr = inrAmount || Number((Number(amount) * 95.67).toFixed(2));
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(Number(fallbackInr) * 100),
          currency: 'INR',
          receipt,
          notes: { userId },
        });
      }
    } else {
      const amountInPaise = Math.round(Number(amount) * 100);
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: { userId },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
