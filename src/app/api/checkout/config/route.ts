import { NextResponse } from 'next/server';
import { getRazorpayKeys, getPayPalKeys } from '@/lib/razorpayKeys';

export async function GET() {
  const { keyId: razorpayKeyId } = getRazorpayKeys();
  const { clientId: paypalClientId } = getPayPalKeys();

  return NextResponse.json({
    razorpayKeyId,
    paypalClientId,
  });
}
