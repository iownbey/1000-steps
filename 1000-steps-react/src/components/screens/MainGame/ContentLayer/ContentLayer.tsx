import type { PropsWithChildren } from "react";
import { pixelsPerStep } from "../Ground/Ground";
import "./contentLayer.css";

export const ContentLayer = ({
  children,
  stepPos,
}: PropsWithChildren<{ stepPos: number }>) => {
  return (
    <div
      className="content-layer"
      style={{ "--content-z": `${(stepPos + 1) * pixelsPerStep + 1000}px` }}
    >
      {children}
    </div>
  );
};
