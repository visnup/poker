import cx from "classnames";
import React from "react";

export function Hint({
  hidden,
  className,
  children,
  ...props
}: { hidden: boolean } & React.JSX.IntrinsicElements["p"]) {
  return (
    <p className={cx("hint", { hidden }, className)} {...props}>
      {children}
      <style jsx>{`
        .hint {
          position: absolute;
          font-family:
            "Segoe Script", "Bradley Hand", "Apple Chancery", cursive;
          font-size: large;
          opacity: 0.5;
          transition: opacity 1s;
        }
        .hint.hidden {
          opacity: 0;
        }
      `}</style>
    </p>
  );
}
