import cx from "classnames";
import React from "react";

export function Hint({
  visible,
  className,
  children,
  ...props
}: { visible: boolean } & React.JSX.IntrinsicElements["p"]) {
  return (
    <p className={cx("hint", { visible }, className)} {...props}>
      {children}
      <style jsx>{`
        .hint {
          position: absolute;
          font-family:
            "Segoe Script", "Bradley Hand", "Apple Chancery", cursive;
          font-size: large;
          opacity: 0;
          transition: opacity 1s;
        }
        .hint.visible {
          opacity: 0.5;
        }
      `}</style>
    </p>
  );
}
