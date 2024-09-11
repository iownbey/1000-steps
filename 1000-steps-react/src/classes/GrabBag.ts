import { shuffle } from "../Utils";

export class GrabBag<T> {
  source: T[];
  current: T[];

  constructor(items: T[]) {
    this.source = [...items];
    this.reset();
  }

  get empty() {
    return this.current.length === 0;
  }

  pull() {
    return this.current.pop();
  }

  reset() {
    this.current = shuffle(this.source);
  }
}
