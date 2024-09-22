export type MenuButtonProps = {
  label: string;
  onActivate: () => Promise<void>;
  onFocus?: () => void;
};

export const MenuButton = ({ label, onActivate }: MenuButtonProps) => {
  return (
    <button className="shrink-border" onClick={onActivate}>
      {label}
    </button>
  );
};
