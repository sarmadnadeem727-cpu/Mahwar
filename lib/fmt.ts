// lib/fmt.ts
export const fmt = {
  price: (v: number | null | undefined, currency = 'SAR') =>
    v == null ? '—' : `${currency} ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,

  change: (v: number | null | undefined) => {
    if (v == null) return { text: '—', color: 'var(--text3)', prefix: '' };
    return {
      text: `${Math.abs(v).toFixed(2)}%`,
      color: v > 0 ? 'var(--positive)' : v < 0 ? 'var(--negative)' : 'var(--text3)',
      prefix: v > 0 ? '▲ ' : v < 0 ? '▼ ' : '',
    };
  },

  large: (v: number | null | undefined, currency = 'SAR') => {
    if (v == null) return '—';
    if (v >= 1e12) return `${currency} ${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `${currency} ${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${currency} ${(v / 1e6).toFixed(0)}M`;
    return `${currency} ${v.toLocaleString()}`;
  },

  multiple: (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}x`),
  pct: (v: number | null | undefined, dp = 1) => (v == null ? '—' : `${v.toFixed(dp)}%`),

  accounting: (v: number | null | undefined) => {
    if (v == null) return '—';
    if (v < 0) return `(${Math.abs(v).toLocaleString('en-US')})`;
    return v.toLocaleString('en-US');
  },

  millions: (v: number | null | undefined) => fmt.accounting(v == null ? null : Math.round(v)),
};
