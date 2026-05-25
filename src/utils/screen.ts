import type { ScreenSpec } from '@/types';

export function calcAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(width, height);
  return `${width / d}:${height / d}`;
}

export function mmToPx(mm: number, ppi: number = 96): number {
  return Math.round((mm / 25.4) * ppi);
}

export function createCustomScreen(
  name: string,
  widthMm: number,
  heightMm: number,
): ScreenSpec {
  const widthPx = Math.round((widthMm / 16000) * 7680);
  const heightPx = Math.round((heightMm / 4000) * 1920);

  return {
    id: `custom-${Date.now()}`,
    name,
    widthMm,
    heightMm,
    widthPx,
    heightPx,
    aspectRatio: calcAspectRatio(widthPx, heightPx),
  };
}

export function getPreviewScale(screen: ScreenSpec, containerWidth: number): number {
  return containerWidth / screen.widthPx;
}
