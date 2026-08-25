import React, { useContext } from "react";
import { animated, config, useTransition } from "@react-spring/web";
import { slice } from "@/lib/card";
import { CardContext } from "./Card";

export function Popup({
  visible = true,
  closable = false,
  onClose,
  children,
  ...props
}: {
  visible?: boolean;
  closable?: boolean;
  onClose: () => void;
} & React.JSX.IntrinsicElements["div"]) {
  const back = slice(useContext(CardContext).svg);
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
              <div
                className="band"
                dangerouslySetInnerHTML={{ __html: back }}
              />
              <div className="sheet">
                {closable && (
                  <button
                    className="close"
                    onClick={onClose}
                    aria-label="close"
                  >
                    ×
                  </button>
                )}
                {children}
              </div>
            </div>
          </animated.div>
          <style jsx>{`
            .card {
              position: relative;
              box-sizing: border-box;
              display: flex;
              border-radius: 20px;
              box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.2);
              overflow: hidden;
              width: 100%;
              min-height: 504px; /* 250x350 card, scaled */
            }
            .band {
              position: absolute;
              inset: 0;
              line-height: 0;
              pointer-events: none;
            }
            /* the back keeps its pattern inside the margin; the popup wants it
               only in the margin, so drop the clip and cover the middle */
            .band :global([clip-path]) {
              clip-path: none;
            }
            .sheet {
              position: relative;
              display: flex;
              flex: 1;
              flex-direction: column;
              justify-content: center;
              margin: calc(6% + 1px); /* 15 of 250, clearing the drawn box */
              padding: 20px;
              border-radius: 3px;
              background: white;
            }
            .close {
              position: absolute;
              top: 8px;
              right: 10px;
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
              .sheet {
                background: #333;
              }
            }
          `}</style>
        </animated.div>
      ),
  );
}
