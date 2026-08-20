import { NextResponse } from 'next/server';

export const revalidate = 10800; // Cache for 3 hours (10800 seconds) on Vercel Edge CDN

export async function GET() {
  try {
    // Fetch live rates from Frankfurter v2 API
    const res = await fetch('https://api.frankfurter.dev/v2/rates?base=USD', {
      next: { revalidate: 10800 },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Frankfurter API error: ${res.statusText}`);
    }

    const data = await res.json();
    const ratesMap: Record<string, number> = { USD: 1 };

    // Frankfurter v2 returns an array of rate objects [{ quote: "INR", rate: 95.67 }, ...]
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.quote && typeof item.rate === 'number') {
          ratesMap[item.quote] = item.rate;
        }
      });
    } else if (data && data.rates && typeof data.rates === 'object') {
      // Fallback for v1 structure
      Object.assign(ratesMap, data.rates);
    }

    return NextResponse.json(
      {
        success: true,
        base: 'USD',
        rates: ratesMap,
        fetchedAt: new Date().toISOString(),
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching exchange rates from Frankfurter:', error);
    
    // Attempt fallback to Frankfurter v1 endpoint if v2 has issues
    try {
      const v1Res = await fetch('https://api.frankfurter.app/latest?from=USD', {
        next: { revalidate: 10800 },
      });
      const v1Data = await v1Res.json();
      if (v1Data?.rates) {
        return NextResponse.json(
          {
            success: true,
            base: 'USD',
            rates: { USD: 1, ...v1Data.rates },
            fetchedAt: new Date().toISOString(),
            timestamp: Date.now(),
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=86400',
            },
          }
        );
      }
    } catch {}

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}
