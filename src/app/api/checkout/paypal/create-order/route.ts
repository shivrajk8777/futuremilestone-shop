import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing on server');
  }

  const baseUrl = mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to authenticate with PayPal');
  }

  return { accessToken: data.access_token, baseUrl };
}

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

    const { total } = await request.json();

    if (!total || isNaN(Number(total)) || Number(total) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    const { accessToken, baseUrl } = await getPayPalAccessToken();

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: Number(total).toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal create order error response:', data);
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to create PayPal order' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });
  } catch (error: any) {
    console.error('PayPal create order exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
