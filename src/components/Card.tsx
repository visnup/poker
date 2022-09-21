import cx from "classnames";
import { range } from "d3-array";
import { useEffect, useState } from "react";
import { animated, config, useSpring } from "react-spring";

function Column({
  pips = 0,
  suit,
  half,
  pad = 0,
}: {
  pips?: number;
  suit?: string;
  half?: boolean;
  pad?: number;
}) {
  return (
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
          justify-content: ${half || pips === 1
            ? "space-evenly"
            : "space-between"};
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
}
function Face({ rank = "", suit = "" }: { rank?: string; suit?: string }) {
  return (
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
                <Column pips={1} suit={suit} half pad={1} />
                <Column pips={3} suit={suit} />
              </>
            );
          case "8":
            return (
              <>
                <Column pips={3} suit={suit} />
                <Column pips={2} suit={suit} half />
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
                <Column pips={2} suit={suit} half />
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
}

function Back() {
  return (
    <div>
      <style jsx>{`
        div {
          height: 100%;
          background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              hsla(0, 0%, 100%, 0.3) 4px,
              hsla(0, 0%, 100%, 0.3) 5px
            ),
            repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 4px,
                hsla(0, 0%, 100%, 0.3) 4px,
                hsla(0, 0%, 100%, 0.3) 5px
              )
              lightsteelblue;
        }
        @media (prefers-color-scheme: dark) {
          div {
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                hsla(0, 0%, 0%, 0.2) 4px,
                hsla(0, 0%, 0%, 0.2) 5px
              ),
              repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 4px,
                  hsla(0, 0%, 0%, 0.2) 4px,
                  hsla(0, 0%, 0%, 0.2) 5px
                )
                darkslategray;
          }
        }
      `}</style>
    </div>
  );
}

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
      ...(anchor === "left"
        ? { translateX: "-120vw" }
        : { translateY: "-120vh" }),
    },
    to: {
      rotate: r,
      ...(anchor === "left" ? { translateX: "0vw" } : { translateY: "0vh" }),
    },
    delay: Math.random() * 200,
    config: config.slow,
  });
  const revealStyle = useSpring({
    rotateY: revealed ? 180 : 0,
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
