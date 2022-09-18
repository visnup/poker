import { useState } from "react";

// middle: https://codepen.io/jughosta/pen/NqgZOZ

interface CardProps {
  card: string;
  revealed?: boolean;
  flat?: boolean;
  rotation?: number;
}
export function Card({
  card,
  revealed,
  flat,
  rotation,
  ...props
}: CardProps & JSX.IntrinsicElements["div"]) {
  const [r] = useState(() => rotation ?? Math.random() * 10 - 5);
  const [n, suit] = [
    card.slice(0, card.length - 1),
    card.slice(card.length - 1),
  ];
  const color = suit === "♣" || suit === "♠" ? "black" : "red";

  return (
    <div style={{ transform: `rotate(${r}deg)` }}>
      <div className={`area ${revealed ? "revealed" : ""}`} {...props}>
        <div className="card">
          <div className="back"></div>
          <div className="face">
            <div className="corner">
              <div>{n}</div>
              <div>{suit}</div>
            </div>
            <div className="corner">
              <div>{n}</div>
              <div>{suit}</div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .area {
            width: 250px;
            height: 350px;
            perspective: 1000px;
            margin: 10px;
          }
          .area.revealed .card {
            transform: rotateY(180deg);
          }

          .card {
            position: relative;
            transition: all 500ms;
            transform-style: preserve-3d;
            width: 100%;
            height: 100%;
            user-select: none;
          }

          .card > div {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 20px;
            box-shadow: ${flat ? "none" : "0 0 10px hsla(0, 0%, 0%, 0.2)"};
          }
          .back {
            background-color: steelblue;
          }
          .face {
            color: ${color};
            background: white;
            font-size: x-large;
            transform: rotateY(180deg);
          }

          .corner {
            text-align: center;
            position: absolute;
            padding: 10px;
          }
          .corner + .corner {
            right: 0;
            bottom: 0;
            transform: rotate(180deg);
          }
        `}
      </style>
    </div>
  );
}
