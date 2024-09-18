import { isObservable, observable, runInAction } from "@fobx/core";
import { SpritePos } from "./SpriteController";

export class SpriteRenderer {
  imageDimensions = { width: 0, height: 0 };
  cellWidth: number;
  cellHeight: number;
  image: string;
  currentSprite: SpritePos = { x: 0, y: 0 };
  img: HTMLImageElement;

  constructor(image: string, cellWidth: number, cellHeight: number) {
    this.image = image;
    this.cellHeight = cellHeight;
    this.cellWidth = cellWidth;
    observable(this);

    this.img = new Image();
    this.img.onload = () => {
      runInAction(() => {
        this.imageDimensions = {
          width: this.img.width,
          height: this.img.height,
        };
      });
    };
    this.img.src = image;
  }

  get wn() {
    return this.imageDimensions.width / this.cellWidth;
  }

  get hn() {
    return this.imageDimensions.height / this.cellHeight;
  }

  waitForLoad() {
    return new Promise((resolve) => {
      this.img.addEventListener("load", (e) => {
        resolve(e);
      });
    });
  }
}
