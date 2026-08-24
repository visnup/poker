import React from "react";

export function Popup({
  onClose,
  children,
  ...props
}: { onClose: () => void } & React.JSX.IntrinsicElements["div"]) {
  return (
    <div className="overlay" onPointerDown={onClose}>
      <div className="card" {...props}>
        <button className="close" onClick={onClose} aria-label="close">
          ×
        </button>
        {children}
      </div>
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: hsla(0, 0%, 0%, 0.5);
        }
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
          width: min(360px, 100% - 24px);
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
    </div>
  );
}
