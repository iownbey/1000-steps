import { useCallback, useEffect, useState } from "react";
import "./parralaxLayer.css";
import clsx from "clsx";
import { observer } from "@fobx/react";

export type ParralaxLayerProps = {
  maxMouseShift: number;
  zoomMultiplier: number;
  zoomOffset: number;
  zoom: number;
};

function normalize(value: number, max: number) {
  return (value / max) * -2 + 1;
}

export const ParralaxLayer = observer(
  ({
    maxMouseShift,
    zoomMultiplier,
    zoomOffset,
    zoom,
    children,
  }: React.PropsWithChildren<ParralaxLayerProps>) => {
    const [blend, setBlend] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const handleMouse = useCallback((e: MouseEvent) => {
      setBlend(1);
      setMousePos({
        x: normalize(e.screenX, window.innerWidth),
        y: normalize(e.screenY, window.innerHeight),
      });
    }, []);

    const handleMouseOut = useCallback((e: MouseEvent) => {
      setBlend(0);
    }, []);

    useEffect(() => {
      window.addEventListener("mouseout", handleMouseOut);
      window.addEventListener("mousemove", handleMouse);
      return () => {
        window.removeEventListener("mouseout", handleMouseOut);
        window.removeEventListener("mousemove", handleMouse);
      };
    });

    return (
      <div
        className="parralax-layer"
        style={{
          "--manual-left": mousePos.x * maxMouseShift,
          "--manual-top": mousePos.y * maxMouseShift,
          "--blend": blend ? 1 : 0,
          "--zoom": zoomOffset + zoom * zoomMultiplier,
        }}
      >
        {children}
      </div>
    );
  }
);
