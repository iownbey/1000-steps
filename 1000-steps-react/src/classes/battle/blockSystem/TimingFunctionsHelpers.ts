export function easeInOut(t: number) {
  return t * t * (3.0 - 2.0 * t);
}

export function convertToFlip(t: number) {
  return 2 * t - 1;
}

export function semicircle(t: number) {
  t = convertToFlip(t);
  return Math.sqrt(t * t);
}

export function linear(t: number) {
  return t;
}

export function inverseLinear(t: number) {
  return 1 - t;
}

export function cosBlend(t: number) {
  return (Math.cos(t * Math.PI) + 1) / 2;
}

export type EasingFunction = (time: number) => number;
