import { useMemo } from 'react';

const formatterCache = new Map();

function getFormatter(locale, options) {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(key);
}

export function useCurrencyFormat(defaultCurrency = 'ZAR') {
  const formatCurrency = useMemo(() => {
    return (amount, currency = defaultCurrency, options = {}) => {
      try {
        const num = Number(amount || 0);
        if (currency === 'ZAR' || currency === 'R') {
          return `R ${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2, ...options })}`;
        }
        const formatter = getFormatter("en-ZA", {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
          ...options,
        });
        return formatter.format(num);
      } catch (error) {
        return `R ${Number(amount || 0).toFixed(2)}`;
      }
    };
  }, [defaultCurrency]);

  return formatCurrency;
}
