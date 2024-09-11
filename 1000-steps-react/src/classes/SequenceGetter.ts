export class SequenceGetter<T> {
  loop: boolean;
  i: number = 0;
  array: T[];

  constructor(array: T[], loop = false) {
    this.array = array;
    this.loop = loop;
  }

  get() {
    var r = this.array[this.i];
    if (this.loop) {
      this.i = (this.i + 1) % this.array.length;
    } else if (this.i !== this.array.length - 1) this.i++;
    return r;
  }
}
