import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const headers = request.headers;
    
    // Check standard edge platform geolocation headers
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country-code') ||
      headers.get('x-geo-country');

    if (country && country !== 'XX' && country !== 'T1') {
      return NextResponse.json({ countryCode: country.toUpperCase() });
    }

    return NextResponse.json({ countryCode: null });
  } catch (error) {
    return NextResponse.json({ countryCode: null, error: String(error) }, { status: 500 });
  }
}
