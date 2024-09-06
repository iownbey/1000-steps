export type MenuButtonProps = {
  label: string;
  onActivate: () => Promise<void>;
  onFocus?: () => void;
};

export const MenuButton = ({ label, onActivate, onFocus }: MenuButtonProps) => {
  return (
    <button className="shrink-border" onClick={onActivate} onFocus={onFocus}>
      {label}
    </button>
  );
};
