import "./messageBox.css";
import type { CSSProperties } from "react";

export type MessageBoxType = {
  style?: CSSProperties;
};

export const MessageBox = ({
  children,
  style,
}: React.PropsWithChildren<MessageBoxType>) => {
  return (
    <div className="message-box" style={style}>
      <div
        className="decoration"
        style={{
          top: "0px",
          left: "0px",
          filter: "brightness(0.7)",
        }}
      />
      <div
        className="decoration"
        style={{
          top: "0px",
          right: "0px",
          transform: "scaleX(-1)",
          filter: "brightness(0.85)",
        }}
      />
      <div
        className="decoration"
        style={{ bottom: "0px", right: "0px", transform: "scale(-1)" }}
      />
      <div
        className="decoration"
        style={{
          bottom: "0px",
          left: "0px",
          transform: "scaleY(-1)",
          filter: "brightness(0.85)",
        }}
      />
      {children}
    </div>
  );
};
