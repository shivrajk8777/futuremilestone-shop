const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const BASE_URL =
  PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Generate an OAuth 2.0 Access Token from PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Missing PayPal Client ID or Secret in environment variables.');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate PayPal Access Token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal Order
 */
export async function createPayPalOrder(amount: number, currency: string = 'USD') {
  const accessToken = await getPayPalAccessToken();
  const url = `${BASE_URL}/v2/checkout/orders`;

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value: Number(amount).toFixed(2),
        },
      },
    ],
  };

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create PayPal order');
  }

  return response.json();
}

/**
 * Capture payment for a PayPal Order
 */
export async function capturePayPalOrder(orderID: string) {
  const accessToken = await getPayPalAccessToken();
  const url = `${BASE_URL}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to capture PayPal order');
  }

  return response.json();
}
