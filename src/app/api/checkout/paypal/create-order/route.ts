import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { amount, currency } = await request.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount.' },
        { status: 400 }
      );
    }

    // Default to USD for international payments if currency is INR or missing
    const orderCurrency = currency && currency !== 'INR' ? currency : 'USD';

    const orderData = await createPayPalOrder(Number(amount), orderCurrency);

    return NextResponse.json({
      success: true,
      orderID: orderData.id,
    });
  } catch (error: any) {
    console.error('PayPal create-order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
