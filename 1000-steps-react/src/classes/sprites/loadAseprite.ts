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
    getRenderer: () =>
      new CssSpriteRenderer(
        imgFile,
        metadata.meta.size.w / metadata.frames.length,
        metadata.meta.size.h
      ),
    animations: Object.fromEntries(
      metadata.meta.frameTags.map((ft) => [
        ft.name,
        loadAsepriteAnimation(ft, metadata.frames),
      ])
    ),
  };
}

function loadAsepriteAnimation(tag: AsepriteTag, allFrames: AsepriteFrame[]) {
  const frames = [] as SpriteAnimationFrame[];
  for (let i = tag.from; i <= tag.to; i++) {
    frames.push(<SpriteAnimationFrame>{
      x: i,
      y: 0,
      time: allFrames[i].duration,
    });
  }
  return frames;
}
