import { CssSpriteRenderer } from "./CssSpriteRenderer";
import { SpriteAnimationFrame } from "./SpriteController";

export type AsepriteFrame = {
  frame: {
    x: number;
    y: number;
  };
  duration: number;
};

export type AsepriteTag = {
  name: string;
  from: number;
  to: number;
};

export interface AsepriteMetadata {
  frames: AsepriteFrame[];
  meta: {
    size: {
      w: number;
      h: number;
    };
    frameTags: AsepriteTag[];
  };
}

export function loadAsepriteSpritesheet(
  imgFile: string,
  metadata: AsepriteMetadata
) {
  return {
    spritesheet: new CssSpriteRenderer(imgFile, metadata.frames.length, 1),
    animations: Object.fromEntries(
      metadata.meta.frameTags.map((ft) => [
        ft.name,
        loadAsepriteAnimation(ft, metadata.frames),
      ])
    ),
  };
}

function loadAsepriteAnimation(tag: AsepriteTag, allFrames: AsepriteFrame[]) {
  const frames = [];
  for (let i = tag.from; i <= tag.to; i++) {
    frames.push(<SpriteAnimationFrame>{
      x: i,
      y: 0,
      duration: allFrames[i].duration,
    });
  }
  return frames;
}
