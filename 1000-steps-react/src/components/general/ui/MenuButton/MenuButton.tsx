import React, { forwardRef, useEffect, useState } from "react";
import { useAndForwardRef } from "../../../../hooks/useAndForwardRef";
import clsx from "clsx";

export type MenuButtonProps = {
  onActivate?: () => void;
  className?: string;
  selected?: boolean;
  upperRef?: React.RefObject<HTMLElement>;
  lowerRef?: React.RefObject<HTMLElement>;
  rightRef?: React.RefObject<HTMLElement>;
  leftRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const MenuButton = forwardRef<HTMLDivElement, MenuButtonProps>(
  (
    {
      upperRef,
      lowerRef,
      rightRef,
      leftRef,
      onActivate,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const [activated, setActivated] = useState(false);
    const onClickInternal = () => {
      setActivated(true);
      onActivate?.();
    };

    const innerRef = useAndForwardRef(ref);

    useEffect(() => {
      const keyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case " ":
          case "Enter":
            {
              innerRef.current?.click();
            }
            break;
          case "w":
          case "ArrowUp":
            {
              upperRef?.current?.focus();
            }
            break;
          case "s":
          case "ArrowDown":
            {
              lowerRef?.current?.focus();
            }
            break;
          case "d":
          case "ArrowRight":
            {
              rightRef?.current?.focus();
            }
            break;
          case "a":
          case "ArrowLeft":
            {
              leftRef?.current?.focus();
            }
            break;
        }
      };
      document.addEventListener("keydown", keyDown);
      return () => {
        document.removeEventListener("keydown", keyDown);
      };
    });

    return (
      <div
        ref={innerRef}
        onClick={onClickInternal}
        className={clsx(className, activated && "activated")}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
