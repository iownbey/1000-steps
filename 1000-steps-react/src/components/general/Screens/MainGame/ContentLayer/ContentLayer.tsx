import { PropsWithChildren } from "react";
import { pixelsPerStep } from "../Ground/Ground";
import "./contentLayer.css";

export const ContentLayer = ({
  children,
  stepPos,
}: PropsWithChildren<{ stepPos: number }>) => {
  return (
    <div
      className="content-layer"
      style={{ "--content-z": `${stepPos * pixelsPerStep + 1000}px` }}
    >
      {children}
    </div>
  );
};
