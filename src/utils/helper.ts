export function sleep(ms: number = 1000) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(ms);
    }, Math.abs(ms)),
  );
}

export function isNativePlatform() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any)?.Capacitor?.isNativePlatform?.();
}

/** Format a number as a rounded integer with thousand separators. e.g. 38230.08 → "38,230" */
export const fmt = (n: number) => Math.round(n).toLocaleString();
