export class NonrepeatingGetter<T> {
  array: T[];
  last = -1;

  constructor(array: T[]) {
    this.array = array;
  }

  get(): T {
    if (this.array.length <= 2) return this.array[0];

    const choosable = [
      ...this.array.slice(0, this.last),
      ...this.array.slice(this.last + 1),
    ];
    this.last = Math.floor(Math.random() * choosable.length);
    return choosable[this.last];
  }
}
