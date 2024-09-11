class Queue<T> {
  array: T[] = [];

  get empty() {
    return this.array.length === 0;
  }

  push(element: T) {
    this.array.unshift(element);
  }

  peek() {
    return this.array[this.array.length - 1];
  }

  replace(element: T) {
    this.array[this.array.length - 1] = element;
  }

  pop() {
    return this.array.pop();
  }

  priorityPush(element: T) {
    this.array.push(element);
  }
}
