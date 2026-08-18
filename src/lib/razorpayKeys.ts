import fs from 'fs';
import path from 'path';

export function getRazorpayKeys(): { keyId: string; keySecret: string } {
  let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || '';
  let keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

  if (!keyId || !keySecret) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('NEXT_PUBLIC_RAZORPAY_KEY_ID=')) {
            const val = trimmed.substring('NEXT_PUBLIC_RAZORPAY_KEY_ID='.length).trim();
            if (val) keyId = keyId || val;
          }
          if (trimmed.startsWith('RAZORPAY_KEY_SECRET=')) {
            const val = trimmed.substring('RAZORPAY_KEY_SECRET='.length).trim();
            if (val) keySecret = keySecret || val;
          }
        }
      }
    } catch (err) {
      console.error('Failed to read .env fallback for Razorpay keys:', err);
    }
  }

  return { keyId, keySecret };
}
