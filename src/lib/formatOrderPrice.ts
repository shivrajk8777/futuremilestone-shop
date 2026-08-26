export function formatOrderPrice(val: any, orderCurrencySymbol?: string, orderCurrency?: string) {
  if (val === undefined || val === null || val === '') return '$0.00';

  let strVal = String(val).trim();

  // Strip accidental prepended "$" if strVal starts with "$₹" or similar
  if (strVal.startsWith('$') && strVal.length > 1 && /^[₹$€£₨৳]/.test(strVal.slice(1))) {
    strVal = strVal.slice(1);
  }

  // Extract leading symbol if any
  const leadingSymbol = strVal.match(/^([₹$€£₨৳])/)?.[1];

  // If already formatted with a currency symbol
  if (leadingSymbol) {
    if (orderCurrencySymbol && leadingSymbol !== orderCurrencySymbol) {
      const cleanNum = Number(strVal.replace(/[^0-9.-]+/g, ''));
      if (!isNaN(cleanNum)) {
        return formatNumWithSymbol(cleanNum, orderCurrencySymbol, orderCurrency);
      }
    }
    return strVal;
  }

  // Extract raw number
  const num = Number(strVal.replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return strVal || '$0.00';

  const symbol = orderCurrencySymbol || '$';
  return formatNumWithSymbol(num, symbol, orderCurrency);
}

function formatNumWithSymbol(num: number, symbol: string, currency?: string): string {
  const isINR = symbol === '₹' || currency === 'INR';
  const locale = isINR ? 'en-IN' : 'en-US';

  const formattedNum = num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${formattedNum}`;
}

