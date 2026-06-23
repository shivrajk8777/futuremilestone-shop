'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Country {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  flag: string;       // emoji flag
  currency: string;   // ISO 4217 currency code
  symbol: string;     // currency symbol
  rate: number;       // exchange rate relative to USD
}

// Static exchange rates (base: USD). Updated periodically.
export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States',          flag: '🇺🇸', currency: 'USD', symbol: '$',   rate: 1 },
  { code: 'IN', name: 'India',                  flag: '🇮🇳', currency: 'INR', symbol: '₹',   rate: 83.5 },
  { code: 'PK', name: 'Pakistan',               flag: '🇵🇰', currency: 'PKR', symbol: '₨',   rate: 278 },
  { code: 'BD', name: 'Bangladesh',             flag: '🇧🇩', currency: 'BDT', symbol: '৳',   rate: 110 },
  { code: 'GB', name: 'United Kingdom',         flag: '🇬🇧', currency: 'GBP', symbol: '£',   rate: 0.79 },
  { code: 'DE', name: 'Germany',                flag: '🇩🇪', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'FR', name: 'France',                 flag: '🇫🇷', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'IT', name: 'Italy',                  flag: '🇮🇹', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'ES', name: 'Spain',                  flag: '🇪🇸', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'NL', name: 'Netherlands',            flag: '🇳🇱', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'BE', name: 'Belgium',                flag: '🇧🇪', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'AT', name: 'Austria',                flag: '🇦🇹', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'PT', name: 'Portugal',               flag: '🇵🇹', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'GR', name: 'Greece',                 flag: '🇬🇷', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'IE', name: 'Ireland',                flag: '🇮🇪', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'FI', name: 'Finland',                flag: '🇫🇮', currency: 'EUR', symbol: '€',   rate: 0.92 },
  { code: 'SE', name: 'Sweden',                 flag: '🇸🇪', currency: 'SEK', symbol: 'kr',  rate: 10.5 },
  { code: 'NO', name: 'Norway',                 flag: '🇳🇴', currency: 'NOK', symbol: 'kr',  rate: 10.6 },
  { code: 'DK', name: 'Denmark',                flag: '🇩🇰', currency: 'DKK', symbol: 'kr',  rate: 6.9 },
  { code: 'CH', name: 'Switzerland',            flag: '🇨🇭', currency: 'CHF', symbol: 'Fr',  rate: 0.9 },
  { code: 'CA', name: 'Canada',                 flag: '🇨🇦', currency: 'CAD', symbol: 'C$',  rate: 1.36 },
  { code: 'AU', name: 'Australia',              flag: '🇦🇺', currency: 'AUD', symbol: 'A$',  rate: 1.53 },
  { code: 'NZ', name: 'New Zealand',            flag: '🇳🇿', currency: 'NZD', symbol: 'NZ$', rate: 1.63 },
  { code: 'JP', name: 'Japan',                  flag: '🇯🇵', currency: 'JPY', symbol: '¥',   rate: 157 },
  { code: 'CN', name: 'China',                  flag: '🇨🇳', currency: 'CNY', symbol: '¥',   rate: 7.25 },
  { code: 'KR', name: 'South Korea',            flag: '🇰🇷', currency: 'KRW', symbol: '₩',   rate: 1360 },
  { code: 'SG', name: 'Singapore',              flag: '🇸🇬', currency: 'SGD', symbol: 'S$',  rate: 1.35 },
  { code: 'HK', name: 'Hong Kong',              flag: '🇭🇰', currency: 'HKD', symbol: 'HK$', rate: 7.82 },
  { code: 'TW', name: 'Taiwan',                 flag: '🇹🇼', currency: 'TWD', symbol: 'NT$', rate: 32.3 },
  { code: 'MY', name: 'Malaysia',               flag: '🇲🇾', currency: 'MYR', symbol: 'RM',  rate: 4.71 },
  { code: 'TH', name: 'Thailand',               flag: '🇹🇭', currency: 'THB', symbol: '฿',   rate: 36.5 },
  { code: 'ID', name: 'Indonesia',              flag: '🇮🇩', currency: 'IDR', symbol: 'Rp',  rate: 16200 },
  { code: 'PH', name: 'Philippines',            flag: '🇵🇭', currency: 'PHP', symbol: '₱',   rate: 56.5 },
  { code: 'VN', name: 'Vietnam',                flag: '🇻🇳', currency: 'VND', symbol: '₫',   rate: 25400 },
  { code: 'AE', name: 'United Arab Emirates',   flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', rate: 3.67 },
  { code: 'SA', name: 'Saudi Arabia',           flag: '🇸🇦', currency: 'SAR', symbol: '﷼',   rate: 3.75 },
  { code: 'QA', name: 'Qatar',                  flag: '🇶🇦', currency: 'QAR', symbol: 'ر.ق', rate: 3.64 },
  { code: 'KW', name: 'Kuwait',                 flag: '🇰🇼', currency: 'KWD', symbol: 'د.ك', rate: 0.31 },
  { code: 'BH', name: 'Bahrain',                flag: '🇧🇭', currency: 'BHD', symbol: 'BD',  rate: 0.377 },
  { code: 'OM', name: 'Oman',                   flag: '🇴🇲', currency: 'OMR', symbol: 'ر.ع', rate: 0.385 },
  { code: 'EG', name: 'Egypt',                  flag: '🇪🇬', currency: 'EGP', symbol: 'E£',  rate: 30.9 },
  { code: 'TR', name: 'Turkey',                 flag: '🇹🇷', currency: 'TRY', symbol: '₺',   rate: 32.5 },
  { code: 'ZA', name: 'South Africa',           flag: '🇿🇦', currency: 'ZAR', symbol: 'R',   rate: 18.6 },
  { code: 'NG', name: 'Nigeria',                flag: '🇳🇬', currency: 'NGN', symbol: '₦',   rate: 1480 },
  { code: 'KE', name: 'Kenya',                  flag: '🇰🇪', currency: 'KES', symbol: 'Ksh', rate: 129 },
  { code: 'GH', name: 'Ghana',                  flag: '🇬🇭', currency: 'GHS', symbol: 'GH₵', rate: 15.7 },
  { code: 'MA', name: 'Morocco',                flag: '🇲🇦', currency: 'MAD', symbol: 'MAD', rate: 10.0 },
  { code: 'BR', name: 'Brazil',                 flag: '🇧🇷', currency: 'BRL', symbol: 'R$',  rate: 4.97 },
  { code: 'MX', name: 'Mexico',                 flag: '🇲🇽', currency: 'MXN', symbol: 'MX$', rate: 17.2 },
  { code: 'AR', name: 'Argentina',              flag: '🇦🇷', currency: 'ARS', symbol: 'AR$', rate: 870 },
  { code: 'CO', name: 'Colombia',               flag: '🇨🇴', currency: 'COP', symbol: 'CO$', rate: 3950 },
  { code: 'CL', name: 'Chile',                  flag: '🇨🇱', currency: 'CLP', symbol: 'CL$', rate: 940 },
  { code: 'PE', name: 'Peru',                   flag: '🇵🇪', currency: 'PEN', symbol: 'S/',  rate: 3.72 },
  { code: 'RU', name: 'Russia',                 flag: '🇷🇺', currency: 'RUB', symbol: '₽',   rate: 91.5 },
  { code: 'PL', name: 'Poland',                 flag: '🇵🇱', currency: 'PLN', symbol: 'zł',  rate: 3.97 },
  { code: 'CZ', name: 'Czech Republic',         flag: '🇨🇿', currency: 'CZK', symbol: 'Kč',  rate: 23.1 },
  { code: 'HU', name: 'Hungary',                flag: '🇭🇺', currency: 'HUF', symbol: 'Ft',  rate: 362 },
  { code: 'RO', name: 'Romania',                flag: '🇷🇴', currency: 'RON', symbol: 'lei', rate: 4.58 },
  { code: 'LK', name: 'Sri Lanka',              flag: '🇱🇰', currency: 'LKR', symbol: 'Rs',  rate: 305 },
  { code: 'NP', name: 'Nepal',                  flag: '🇳🇵', currency: 'NPR', symbol: 'रू',  rate: 133 },
  { code: 'MM', name: 'Myanmar',                flag: '🇲🇲', currency: 'MMK', symbol: 'K',   rate: 2100 },
  { code: 'AF', name: 'Afghanistan',            flag: '🇦🇫', currency: 'AFN', symbol: '؋',   rate: 71.5 },
  { code: 'IR', name: 'Iran',                   flag: '🇮🇷', currency: 'IRR', symbol: '﷼',   rate: 42000 },
  { code: 'IQ', name: 'Iraq',                   flag: '🇮🇶', currency: 'IQD', symbol: 'ع.د', rate: 1309 },
  { code: 'IL', name: 'Israel',                 flag: '🇮🇱', currency: 'ILS', symbol: '₪',   rate: 3.75 },
  { code: 'JO', name: 'Jordan',                 flag: '🇯🇴', currency: 'JOD', symbol: 'JD',  rate: 0.71 },
  { code: 'LB', name: 'Lebanon',                flag: '🇱🇧', currency: 'LBP', symbol: 'ل.ل', rate: 89500 },
  { code: 'PK', name: 'Pakistan',               flag: '🇵🇰', currency: 'PKR', symbol: '₨',   rate: 278 },
  { code: 'UA', name: 'Ukraine',                flag: '🇺🇦', currency: 'UAH', symbol: '₴',   rate: 38.5 },
  { code: 'KZ', name: 'Kazakhstan',             flag: '🇰🇿', currency: 'KZT', symbol: '₸',   rate: 448 },
];

// Remove duplicate entries by country code
const uniqueCountries = COUNTRIES.filter(
  (c, idx, arr) => arr.findIndex((x) => x.code === c.code) === idx
).sort((a, b) => a.name.localeCompare(b.name));

export { uniqueCountries as COUNTRY_LIST };

interface CurrencyContextValue {
  country: Country;
  setCountry: (code: string) => void;
  formatPrice: (usdAmount: number) => string;
  countries: Country[];
}

const DEFAULT_COUNTRY = uniqueCountries.find((c) => c.code === 'US')!;

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>(DEFAULT_COUNTRY);
  const [detected, setDetected] = useState(false);

  // Load saved preference from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('fm_country') : null;
    if (saved) {
      const found = uniqueCountries.find((c) => c.code === saved);
      if (found) {
        setCountryState(found);
        setDetected(true);
        return;
      }
    }
    // Auto-detect via free IP geolocation API (no API key required)
    fetch('https://ip-api.com/json/?fields=countryCode')
      .then((r) => r.json())
      .then((data) => {
        if (data?.countryCode) {
          const found = uniqueCountries.find((c) => c.code === data.countryCode);
          if (found) setCountryState(found);
        }
      })
      .catch(() => {/* silently fall back to USD */})
      .finally(() => setDetected(true));
  }, []);

  const setCountry = useCallback((code: string) => {
    const found = uniqueCountries.find((c) => c.code === code);
    if (found) {
      setCountryState(found);
      localStorage.setItem('fm_country', code);
    }
  }, []);

  const formatPrice = useCallback(
    (usdAmount: number): string => {
      const converted = usdAmount * country.rate;
      // Format based on currency
      if (country.currency === 'JPY' || country.currency === 'KRW' ||
          country.currency === 'IDR' || country.currency === 'VND' ||
          country.currency === 'MMK' || country.currency === 'IRR' ||
          country.currency === 'LBP' || country.currency === 'IQD') {
        // No decimal for large value currencies
        return `${country.symbol}${Math.round(converted).toLocaleString()}`;
      }
      return `${country.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    },
    [country]
  );

  return (
    <CurrencyContext.Provider value={{ country, setCountry, formatPrice, countries: uniqueCountries }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
