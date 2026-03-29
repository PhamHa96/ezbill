import { useAppStore } from '../stores/appStore';
import type { Currency } from '../stores/appStore';

export function fmtAmount(n: number, currency: Currency): string {
  const rounded = Math.round(Math.abs(n));
  if (currency === 'VND') {
    return rounded.toLocaleString('vi-VN') + ' ₫';
  }
  return '$ ' + rounded.toLocaleString();
}

/** Hook that returns a formatter bound to the current currency setting. */
export function useFmt() {
  const currency = useAppStore((s) => s.currency);
  return (n: number) => fmtAmount(n, currency);
}
