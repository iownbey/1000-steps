import { RefObject, useEffect, useRef, useState } from "react";
import "./cursor.css";

export type CursorProps = {
  target: RefObject<HTMLElement>;
  targetAnchorX: number;
  targetAnchorY: number;
  myAnchorX: number;
  myAnchorY: number;
  offset: number;
  show: number;
};

export const Cursor = ({
  target,
  targetAnchorX,
  targetAnchorY,
  myAnchorX,
  myAnchorY,
  offset,
  show,
}: CursorProps) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const myRef = useRef<HTMLDivElement>();

  const updatePosition = () => {
    if (show) {
      const newPos = { x: 0, y: 0 };
      const targetRect = target.current.getBoundingClientRect();
      const myRect = myRef.current.getBoundingClientRect();
      newPos.x =
        targetRect.x +
        targetRect.width * targetAnchorX -
        myRect.width * (1 - myAnchorX);
      newPos.y =
        targetRect.y +
        targetRect.height * targetAnchorY -
        myRect.height * (1 - myAnchorY);

      setPos(newPos);
    }
  };

  useEffect(() => {
    document.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  useEffect(updatePosition, [target, targetAnchorX, targetAnchorY, offset]);

  return (
    <div
      ref={myRef}
      className="cursor"
      style={{ opacity: show ? 1 : 0, left: pos.x, top: pos.y }}
    />
  );
};
