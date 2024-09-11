import { reaction } from "@fobx/core";
import { SpriteRenderer } from "./SpriteRenderer";

export class CanvasSpriteRenderer extends SpriteRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    image: string,
    cellWidth: number,
    cellHeight: number
  ) {
    super(image, cellWidth, cellHeight);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    reaction(
      () => this.currentSprite,
      (spr) => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
          this.img,
          spr.x * this.cellWidth,
          spr.y * this.cellHeight,
          this.cellWidth,
          this.cellHeight,
          0,
          0,
          this.cellWidth,
          this.cellHeight
        );
      }
    );
  }
}
