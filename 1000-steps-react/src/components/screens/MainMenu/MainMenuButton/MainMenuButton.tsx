import React, { forwardRef, useEffect, useState } from "react";
import { useAndForwardRef } from "../../../../hooks/useAndForwardRef";
import { selected } from "../MainMenu";
import clsx from "clsx";
import "./mainMenuButton.css";

export type MainMenuButtonProps = {
  onClick?: () => void;
  upperRef?: React.RefObject<HTMLElement>;
  lowerRef?: React.RefObject<HTMLElement>;
  children: string;
};

function onFocus() {
  selected.value++;
}

function onBlur() {
  selected.value--;
}

export const MainMenuButton = forwardRef<
  HTMLButtonElement,
  MainMenuButtonProps
>(({ upperRef, lowerRef, onClick, children }, ref) => {
  const [activated, setActivated] = useState(false);
  const onClickInternal = () => {
    setActivated(true);
    selected.value = 0;
    onClick?.();
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
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  });

  return (
    <button
      ref={innerRef}
      onClick={onClickInternal}
      onFocus={onFocus}
      onBlur={onBlur}
      className={clsx("main-menu-button", activated && "activated")}
    >
      {children}
    </button>
  );
});
