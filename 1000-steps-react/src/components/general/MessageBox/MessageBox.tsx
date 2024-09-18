import "./messageBox.css";
import { CSSProperties } from "react";

export type MessageBoxType = {
  style?: CSSProperties;
};

export const MessageBox = ({
  children,
  style,
}: React.PropsWithChildren<MessageBoxType>) => {
  return (
    <div className="message-box" style={style}>
      {children}
    </div>
  );
};
