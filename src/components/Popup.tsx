import React from "react";
import { animated, config, useTransition } from "@react-spring/web";

export function Popup({
  visible = true,
  onClose,
  children,
  ...props
}: {
  visible?: boolean;
  onClose: () => void;
} & React.JSX.IntrinsicElements["div"]) {
  const transitions = useTransition(visible, {
    from: { opacity: 0, y: "100vh" },
    enter: { opacity: 1, y: "0vh" },
    leave: { opacity: 0, y: "100vh" },
    config: config.default,
  });

  // styled-jsx scopes host elements only, never animated.div, so the classes
  // stay on plain divs and the animated wrappers carry inline styles.
  return transitions(
    (style, shown) =>
      shown && (
        <animated.div
          className="overlay"
          onPointerDown={onClose}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "hsla(0, 0%, 0%, 0.5)",
            opacity: style.opacity,
          }}
        >
          <animated.div
            style={{
              y: style.y,
              flex: "none",
              width: "min(360px, 100% - 24px)",
            }}
          >
            <div className="card" {...props}>
              <button className="close" onClick={onClose} aria-label="close">
                ×
              </button>
              {children}
            </div>
          </animated.div>
          <style jsx>{`
            .card {
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background: white;
              border-radius: 20px;
              box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.2);
              padding: 32px;
              width: 100%;
              min-height: 504px; /* 250x350 card, scaled */
            }
            .close {
              position: absolute;
              top: 12px;
              right: 16px;
              font: inherit;
              font-size: 24px;
              line-height: 1;
              background: none;
              border: none;
              padding: 4px;
              opacity: 0.3;
              cursor: pointer;
              color: inherit;
            }
            @media (prefers-color-scheme: dark) {
              .card {
                background: #333;
              }
            }
          `}</style>
        </animated.div>
      ),
  );
}
