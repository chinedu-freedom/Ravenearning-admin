import { useMemo } from 'react';

const formatterCache = new Map();

function getFormatter(locale, options) {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(key);
}

export function useCurrencyFormat(defaultCurrency = 'ETB') {
  const formatCurrency = useMemo(() => {
    return (amount, currency = defaultCurrency, options = {}) => {
      try {
        const num = Number(amount || 0);
        if (currency === 'ETB' || currency === 'Br' || currency === 'ZAR' || currency === 'R') {
          return `Br ${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2, ...options })}`;
        }
        const formatter = getFormatter("en-ET", {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
          ...options,
        });
        return formatter.format(num);
      } catch (error) {
        return `Br ${Number(amount || 0).toFixed(2)}`;
      }
    };
  }, [defaultCurrency]);

  return formatCurrency;
}
