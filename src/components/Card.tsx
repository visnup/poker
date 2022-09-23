import cx from "classnames";
import { range } from "d3-array";
import { useEffect, useState } from "react";
import { animated, config, useSpring } from "react-spring";

const Column = ({
  pips = 0,
  suit,
  justify = "space-between",
  pad = 0,
}: {
  pips?: number;
  suit?: string;
  justify?: string;
  pad?: number;
}) => (
  <div className="column">
    {range(0, pips).map((i) => (
      <div key={i}>{suit}</div>
    ))}
    {range(0, pad).map((i) => (
      <div key={i} className="pad">
        {suit}
      </div>
    ))}
    <style jsx>{`
      .column {
        display: flex;
        flex-direction: column;
        justify-content: ${pips === 1 ? "space-evenly" : justify};
        font-size: 48px;
        padding: 30px 0;
        width: 30%;
        text-align: center;
      }
      .pad {
        color: transparent;
      }
      .column > div:last-of-type,
      .column > div:nth-of-type(3) {
        transform: rotate(180deg);
      }
      .column > div:first-of-type {
        transform: none;
      }
    `}</style>
  </div>
);
const Face = ({ rank = "", suit = "" }: { rank?: string; suit?: string }) => (
  <div className={cx("face", { red: "♦♥".includes(suit) })} data-rank={rank}>
    {(() => {
      switch (rank) {
        case "2":
        case "3":
          return <Column pips={+rank} suit={suit} />;
        case "4":
          return (
            <>
              <Column pips={2} suit={suit} />
              <Column />
              <Column pips={2} suit={suit} />
            </>
          );
        case "5":
          return (
            <>
              <Column pips={2} suit={suit} />
              <Column pips={1} suit={suit} />
              <Column pips={2} suit={suit} />
            </>
          );
        case "6":
          return (
            <>
              <Column pips={3} suit={suit} />
              <Column />
              <Column pips={3} suit={suit} />
            </>
          );
        case "7":
          return (
            <>
              <Column pips={3} suit={suit} />
              <Column pips={1} suit={suit} pad={1} />
              <Column pips={3} suit={suit} />
            </>
          );
        case "8":
          return (
            <>
              <Column pips={3} suit={suit} />
              <Column pips={2} suit={suit} justify="space-evenly" />
              <Column pips={3} suit={suit} />
            </>
          );
        case "9":
          return (
            <>
              <Column pips={4} suit={suit} />
              <Column pips={1} suit={suit} />
              <Column pips={4} suit={suit} />
            </>
          );
        case "10":
          return (
            <>
              <Column pips={4} suit={suit} />
              <Column pips={2} suit={suit} justify="space-around" />
              <Column pips={4} suit={suit} />
            </>
          );
        case "J":
          return <div className="court">♞</div>;
        case "Q":
          return <div className="court">♛</div>;
        case "K":
          return <div className="court">♚</div>;
        case "A":
          return <Column pips={1} suit={suit} />;
      }
    })()}
    <style jsx>{`
      .face {
        background: white;
        font-size: 32px;
        box-sizing: border-box;
        padding: 10px;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: stretch;
      }
      .face.red {
        color: red;
      }
      @media (prefers-color-scheme: dark) {
        .face {
          background: #333;
        }
        .face.red {
          color: firebrick;
        }
      }

      .face:before,
      .face:after {
        content: attr(data-rank) " ${suit}";
        text-align: center;
        width: 1.1em;
      }
      .face:after {
        transform: rotate(180deg);
      }

      .court {
        align-self: center;
        font-size: 128px;
      }
    `}</style>
  </div>
);

// Sol LeWitt
// Lines of One Inch, Four Directions, Four Colors, from Sixteen Lithographs in Color
const margin = 15;
const length = 100;
const points = range(0, 300).map(() => [
  Math.random() * 250 - length / 2,
  Math.random() * (350 - 2 * margin) + margin,
  Math.random() + 1,
]);
const Back = () => (
  <svg viewBox="0 0 250 350" width="100%" height="100%">
    <rect
      x={margin}
      y={margin}
      width={250 - 2 * margin}
      height={350 - 2 * margin}
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.5"
      rx="2"
    />
    {points.map(([x, y, w], i) => (
      <line
        key={i}
        x1={Math.max(x, margin)}
        y1={y}
        x2={Math.min(x + length, 250 - margin)}
        y2={y}
        stroke="currentColor"
        strokeWidth={w}
        strokeOpacity="0.5"
      />
    ))}
    <style jsx>{`
      svg {
        background-color: white;
        color: steelblue;
      }
      @media (prefers-color-scheme: dark) {
        svg {
          background-color: #333;
        }
      }
    `}</style>
  </svg>
);

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

  const dealStyle = useSpring({
    reverse: card === undefined,
    from: {
      rotate: 0,
      ...(anchor === "left" ? { x: "-120vw" } : { y: "-120vh" }),
    },
    to: {
      rotate: r,
      ...(anchor === "left" ? { x: "0vw" } : { y: "0vh" }),
    },
    delay: Math.random() * 200,
    config: { ...config.slow, precision: 0.0001 },
  });
  const revealStyle = useSpring({
    rotateY: revealed ? 180 : 0,
    x: revealed ? -250 : 0,
    delay: Math.random() * 200,
    config: config.slow,
  });

  const [rank, suit] = [
    card?.slice(0, card.length - 1),
    card?.slice(card.length - 1),
  ];

  return (
    <animated.div style={dealStyle}>
      <div className={cx("area")} {...props}>
        <animated.div
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "right center",
            height: "100%",
            ...revealStyle,
          }}
        >
          <div className="card">
            <div className="back">
              <Back />
            </div>
            <div className="face">
              <Face rank={rank} suit={suit} />
            </div>
          </div>
        </animated.div>
      </div>
      <style jsx>
        {`
          .area {
            width: 250px;
            height: 350px;
            perspective: 1000px;
            margin: 10px;
          }

          .card {
            position: relative;
            height: 100%;
          }

          .back,
          .face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 20px;
            box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.2);
            overflow: hidden;
          }
          .face {
            transform: rotateY(180deg);
          }
        `}
      </style>
    </animated.div>
  );
}
