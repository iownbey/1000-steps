export const randomInt = function (min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

export const getPercentage = function (numerator: number, dividend: number) {
  return ((numerator - 1) / (dividend - 1) || 0) * 100;
};

export function getRandom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}
