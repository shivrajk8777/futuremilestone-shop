export function formatOrderPrice(val: any, orderCurrencySymbol?: string, orderCurrency?: string) {
  if (!val && val !== 0) return '';
  let strVal = String(val).trim();

  // Strip accidental prepended "$" if strVal already starts with another currency symbol like "₹"
  if (strVal.startsWith('$') && strVal.length > 1 && /^[₹$€£₨৳]/.test(strVal.slice(1))) {
    strVal = strVal.slice(1);
  }

  // If already formatted with currency symbol like "₹60" or "$60.00"
  if (/^[₹$€£₨৳]/.test(strVal)) {
    const symbolMatches = strVal.match(/^([₹$€£₨৳])\s*(.*)$/);
    if (symbolMatches && symbolMatches[2]) {
      const numPart = Number(symbolMatches[2].replace(/,/g, ''));
      if (!isNaN(numPart)) {
        const formatted = numPart.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${symbolMatches[1]}${formatted}${orderCurrency ? ` ${orderCurrency}` : ''}`;
      }
    }
    return strVal + (orderCurrency ? ` ${orderCurrency}` : '');
  }

  const num = Number(val);
  if (isNaN(num)) return strVal;

  const symbol = orderCurrencySymbol || '$';
  const currencyCode = orderCurrency ? ` ${orderCurrency}` : '';
  const formattedNum = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${formattedNum}${currencyCode}`;
}
