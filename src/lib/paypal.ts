import { getPayPalKeys } from './razorpayKeys';

/**
 * Generate an OAuth 2.0 Access Token from PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret, mode } = getPayPalKeys();

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal Client ID or Secret in environment variables.');
  }

  const baseUrl =
    mode === 'live'
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
  const { mode } = getPayPalKeys();
  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const accessToken = await getPayPalAccessToken();
  const url = `${baseUrl}/v2/checkout/orders`;

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
  const { mode } = getPayPalKeys();
  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const accessToken = await getPayPalAccessToken();
  const url = `${baseUrl}/v2/checkout/orders/${orderID}/capture`;

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
