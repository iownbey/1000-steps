import React from "react";
import { MenuButton } from "./MenuButton/MenuButton";

export type MenuButtonSpec = {
  label: string;
  description?: string;
  onActivate: () => Promise<void>;
};

export type MenuProps = {
  buttons: MenuButtonSpec[][];
  selected: string;
  onNewButtonSelected: (label: string) => void;
};

export const Menu = ({ buttons, selected }: MenuProps) => {
  return (
    <div>
      {buttons.map((c, i) => {
        return (
          <div key={i}>
            {c.map((b) => {
              const { description, label, onActivate } = b;
              return (
                <MenuButton
                  label={label}
                  onActivate={async () => {
                    onActivate();
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
