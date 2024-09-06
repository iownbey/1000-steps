export class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(addend: Vector2D) {
    return new Vector2D(this.x + addend.x, this.y + addend.y);
  }

  scale(scale: number) {
    return new Vector2D(this.x * scale, this.y * scale);
  }

  /** return a vector with the opposite magnitude*/
  invert() {
    return new Vector2D(-this.x, -this.y);
  }

  /** comparing square magnitudes is faster*/
  sqrMagnitude() {
    return this.x ** 2 + this.y ** 2;
  }

  magnitude() {
    return Math.sqrt(this.sqrMagnitude());
  }

  rotate(rot: number) {
    var cos = Math.cos(rot),
      sin = Math.sin(rot);
    return new Vector2D(
      cos * this.x - sin * this.y,
      sin * this.x + cos * this.y
    );
  }

  normalize() {
    return this.scale(1 / this.magnitude());
  }

  getNormal() {
    return new Vector2D(-this.y, this.x);
  }

  static getNormalVector() {
    return new Vector2D(0, 1);
  }
}
