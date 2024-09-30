import { CssSpriteRenderer } from "./CssSpriteRenderer";
import type { SpriteAnimationFrame } from "./SpriteController";

export type AsepriteFrame = {
  frame: {
    x: number;
    y: number;
  };
  duration: number;
};

export type AsepriteTag = {
  from: number;
  to: number;
};

export interface AsepriteMetadata<T extends Record<string, AsepriteTag>> {
  frames: AsepriteFrame[];
  meta: {
    size: {
      w: number;
      h: number;
    };
    frameTags: T;
  };
}

export type AsepriteAnimations<M extends AsepriteMetadata<any>> = {
  [m in keyof M["meta"]["frameTags"]]: SpriteAnimationFrame[];
};

export function loadAsepriteSpritesheet<T extends Record<string, AsepriteTag>>(
  imgFile: string,
  metadata: AsepriteMetadata<T>
) {
  return {
    getRenderer: () =>
      new CssSpriteRenderer(
        imgFile,
        metadata.meta.size.w / metadata.frames.length,
        metadata.meta.size.h
      ),
    animations: Object.fromEntries(
      Object.entries(metadata.meta.frameTags).map(([name, ft]) => [
        name,
        loadAsepriteAnimation(ft, metadata.frames),
      ])
    ) as {
      [t in keyof T]: SpriteAnimationFrame[];
    },
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
