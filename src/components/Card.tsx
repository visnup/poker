import { useEffect, useState } from "react";
import cx from "classnames";
import { useSpring, animated, config } from "react-spring";

// middle: https://codepen.io/jughosta/pen/NqgZOZ

interface CardProps {
  card?: string;
  revealed?: boolean;
  anchor?: "left" | "top";
  rotation?: number;
}
export function Card({
  card,
  revealed,
  anchor = "left",
  rotation,
  ...props
}: CardProps & JSX.IntrinsicElements["div"]) {
  const [r, setR] = useState(() => rotation ?? Math.random() * 10 - 5);
  useEffect(() => setR(rotation ?? Math.random() * 10 - 5), [rotation, card]);

  const deal = useSpring({
    reverse: card === undefined,
    from: {
      rotate: 0,
      ...(anchor === "left"
        ? { translateX: "-120vw" }
        : { translateY: "-120vh" }),
    },
    to: {
      rotate: r,
      ...(anchor === "left" ? { translateX: "0vw" } : { translateY: "0vh" }),
    },
    config: { tension: 100 },
  });

  const [n, suit] = [
    card?.slice(0, card.length - 1),
    card?.slice(card.length - 1),
  ];
  const color = suit === "♣" || suit === "♠" ? "black" : "red";

  return (
    <animated.div style={deal}>
      <div className={cx("area", { revealed })} {...props}>
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
            transition: transform 400ms;
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
            box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.2);
          }
          .back {
            background-color: steelblue;
          }
          .face {
            color: ${color};
            background: white;
            font-size: xx-large;
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
    </animated.div>
  );
}
