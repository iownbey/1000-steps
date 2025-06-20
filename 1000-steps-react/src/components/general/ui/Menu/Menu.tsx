import { Button } from "../Button/Button";
export type MenuButtonSpec = {
  selectionKey: string;
  label: React.ReactNode;
  description?: string;
  onActivate: () => Promise<void>;
};

export type MenuProps = {
  buttons?: MenuButtonSpec[][];
  onNewButtonSelected: (selectionKey: string) => void;
  onDescriptionChanged: (description: string | undefined) => void;
};

export const Menu = ({
  buttons,
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
                <Button
                  key={selectionKey}
                  onFocus={() => onDescriptionChanged(description)}
                  onTrigger={() => {
                    onActivate();
                    onNewButtonSelected(selectionKey);
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
