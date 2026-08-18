import fs from 'fs';
import path from 'path';

export function getRazorpayKeys(): { keyId: string; keySecret: string } {
  let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || '';
  let keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

  // Check .env file directly
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('NEXT_PUBLIC_RAZORPAY_KEY_ID=')) {
          const val = trimmed.substring('NEXT_PUBLIC_RAZORPAY_KEY_ID='.length).trim();
          if (val) keyId = val;
        }
        if (trimmed.startsWith('RAZORPAY_KEY_SECRET=')) {
          const val = trimmed.substring('RAZORPAY_KEY_SECRET='.length).trim();
          if (val) keySecret = val;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read .env fallback for Razorpay keys:', err);
  }

  return { keyId, keySecret };
}

export function getPayPalKeys(): { clientId: string; clientSecret: string; mode: string } {
  let clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || '';
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() || '';
  let mode = process.env.PAYPAL_MODE?.trim() || 'sandbox';

  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('NEXT_PUBLIC_PAYPAL_CLIENT_ID=')) {
          const val = trimmed.substring('NEXT_PUBLIC_PAYPAL_CLIENT_ID='.length).trim();
          if (val) clientId = val;
        }
        if (trimmed.startsWith('PAYPAL_CLIENT_SECRET=')) {
          const val = trimmed.substring('PAYPAL_CLIENT_SECRET='.length).trim();
          if (val) clientSecret = val;
        }
        if (trimmed.startsWith('PAYPAL_MODE=')) {
          const val = trimmed.substring('PAYPAL_MODE='.length).trim();
          if (val) mode = val;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read .env fallback for PayPal keys:', err);
  }

  return { clientId, clientSecret, mode };
}
