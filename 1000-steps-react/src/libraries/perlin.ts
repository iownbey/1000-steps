import { Vector2D } from "../classes/Vector2D";

export class PerlinNoise {
  memory: Map<[number, number], number> = new Map();
  gradients: Map<[number, number], Vector2D> = new Map();

  getNoise(x: number, y: number) {
    const mem = this.memory.get([x, y]);
    if (typeof mem !== undefined) return mem;
    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = this.dot_prod_grid(x, y, xf, yf);
    let tr = this.dot_prod_grid(x, y, xf + 1, yf);
    let bl = this.dot_prod_grid(x, y, xf, yf + 1);
    let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    let xt = this.interpolate(x - xf, tl, tr);
    let xb = this.interpolate(x - xf, bl, br);
    let v = this.interpolate(y - yf, xt, xb);
    this.memory.set([x, y], v);
    return v;
  }

  dot_prod_grid(x: number, y: number, vx: number, vy: number) {
    let g_vect: Vector2D;
    let d_vect = { x: x - vx, y: y - vy };
    const grad = this.gradients.get([vx, vy]);
    if (grad) {
      g_vect = grad;
    } else {
      g_vect = this.randomVector();
      this.gradients.set([vx, vy], g_vect);
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  }

  private interpolate(x: number, a: number, b: number) {
    return a + this.smooth(x) * (b - a);
  }

  private smooth(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }

  private randomVector() {
    const theta = Math.random() * 2 * Math.PI;
    return new Vector2D(Math.cos(theta), Math.sin(theta));
  }
}
