import { MenuButton } from "../MenuButton/MenuButton";

export type MenuButtonSpec = {
  selectionKey: string;
  label: React.ReactNode;
  description?: string;
  onActivate: () => Promise<void>;
};

export type MenuProps = {
  buttons?: MenuButtonSpec[][];
  selected: string;
  onNewButtonSelected: (selectionKey: string) => void;
  onDescriptionChanged: (description: string | undefined) => void;
};

export const Menu = ({
  buttons,
  selected,
  onNewButtonSelected,
  onDescriptionChanged,
}: MenuProps) => {
  if (!buttons) {
    return null;
  }
  return (
    <div>
      {buttons.map((c, i) => {
        return (
          <div key={i}>
            {c.map((b) => {
              const { description, label, onActivate, selectionKey } = b;
              return (
                <MenuButton
                  key={selectionKey}
                  onFocus={() => onDescriptionChanged(description)}
                  selected={selected === selectionKey}
                  onActivate={() => {
                    onActivate();
                    onNewButtonSelected(selectionKey);
                  }}
                >
                  {label}
                </MenuButton>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
