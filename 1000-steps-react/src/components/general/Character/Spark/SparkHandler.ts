import sparkImage from "./sparks.png";
import baseSparkImage from "./sparkBase.png";
import flameImage from "./flames.png";
import { CssSpriteRenderer } from "../../../../classes/sprites/CssSpriteRenderer";
import { observable } from "@fobx/core";
import { randomInt } from "../../../../Utils";

export type ChargeLevel = 0 | 1 | 2 | 3;

export class SparkHandler {
  baseSparkRenderer = new CssSpriteRenderer(baseSparkImage, 16, 16);
  sparkRenderer = new CssSpriteRenderer(sparkImage, 16, 16);
  flameRenderer = new CssSpriteRenderer(flameImage, 32, 32);
  currentSparkRenderer = this.baseSparkRenderer;
  chargeLevel: ChargeLevel = 0;
  sparkTimeoutHandle: ReturnType<typeof setTimeout>;

  constructor() {
    observable(this);
  }

  setChargeLevel(chargeLevel: ChargeLevel) {
    this.chargeLevel = chargeLevel;
    this.sparkRenderer.stopAnimation();
    this.flameRenderer.stopAnimation();
    clearTimeout(this.sparkTimeoutHandle);
    switch (this.chargeLevel) {
      case 1: {
        let lit = false;
        const flicker = () => {
          if (lit) {
            this.sparkRenderer.randomize();
            this.currentSparkRenderer = this.sparkRenderer;
            this.sparkTimeoutHandle = setTimeout(flicker, 50);
          } else {
            this.currentSparkRenderer = this.baseSparkRenderer;
            this.sparkTimeoutHandle = setTimeout(flicker, randomInt(100, 500));
          }
          lit = !lit;
        };
        flicker();
      }
      case 2: {
        this.flameRenderer.animate({
          frames: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
          ],
          defaultTime: 500,
          loop: true,
        });
      }
    }
  }

  get style() {
    switch (this.chargeLevel) {
      case 1:
        return this.currentSparkRenderer.style;
      case 2:
        return this.flameRenderer.style;
      default:
        return null;
    }
  }

  get className() {
    switch (this.chargeLevel) {
      case 1:
        return "spark";
      case 2:
        return "flame";
      case 3:
        return "aura";
    }
    return "";
  }

  get attributes() {
    return {
      style: { ...this.style },
      className: this.className,
      "data-charge-level": this.chargeLevel,
    };
  }
}
