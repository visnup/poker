import { useDrag } from "@use-gesture/react";
import Head from "next/head";
import { ReactNode, useState } from "react";
import { animated, useSpring } from "react-spring";
import { useMutation, useQuery } from "../../convex/_generated/react";
import { Card } from "./Card";

function DealerButton({
  onMove,
  children,
}: {
  onMove: () => void;
  children: ReactNode;
}) {
  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotate: Math.random() * 20,
  }));
  const bind = useDrag(
    ({
      active,
      last,
      memo = Math.random() * 40 - 20,
      movement,
      offset: [x, y],
    }) => {
      api.start({
        x,
        y,
        scale: active ? 1.1 : 1,
        rotate: memo,
        immediate: (key) => "xy".includes(key),
      });
      if (last && Math.hypot(...movement) > 200) onMove();
      return memo;
    }
  );

  return (
    <animated.div style={{ position: "absolute", top: 30, left: 30, ...style }}>
      <button {...bind()}>{children}</button>
      <style jsx>{`
        button {
          touch-action: none;
          font-size: 42px;
          font-weight: bold;
          text-transform: uppercase;
          text-shadow: 0 -1px 0 hsla(0, 0%, 50%, 0.5);
          background: linear-gradient(-25deg, hsl(0, 0%, 85%), white);
          border-radius: 100%;
          border: solid 1px hsl(0, 0%, 90%);
          box-shadow: 2px 4px 10px hsla(0, 0%, 0%, 0.2);
          color: inherit;
          padding: 0;
          width: 200px;
          height: 200px;
        }
        @media (prefers-color-scheme: dark) {
          button {
            background: linear-gradient(-25deg, #111, hsl(0, 0%, 15%));
            border: solid 1px hsl(0, 0%, 10%);
          }
        }
      `}</style>
    </animated.div>
  );
}

function Board({
  cards,
  revealed = 0,
  ...props
}: { cards: string[]; revealed?: number } & JSX.IntrinsicElements["div"]) {
  const flop = cards.slice(0, 3);
  const turn = cards[3];
  const river = cards[4];

  return (
    <div className="board" {...props}>
      <div className="flop">
        <Card card={flop[0]} revealed={revealed > 0} />
        <Card
          card={flop[1]}
          revealed={revealed > 0}
          style={{ marginLeft: "-45%" }}
        />
        <Card
          card={flop[2]}
          revealed={revealed > 0}
          style={{ marginLeft: "-90%" }}
        />
      </div>
      <Card card={turn} revealed={revealed > 1} />
      <Card card={river} revealed={revealed > 2} />
      <style jsx>
        {`
          .board {
            display: flex;
            padding: 20px;
            transition: all 1s;
          }
          .flop {
            display: flex;
            margin-right: -230px;
          }
        `}
      </style>
    </div>
  );
}

export function Table({ table }: { table: string }) {
  const deal = useMutation("deal");
  const clear = useMutation("clear");
  const dealt = useQuery("getDealt", table);

  // -1 = cleared, 0 = dealt, 1 = flop, 2 = turn, 3 = river
  const [revealed, setRevealed] = useState(0);

  return (
    <div>
      <Head>
        <meta name="viewport" content="width=1140" />
      </Head>
      {dealt ? (
        revealed === -1 || dealt.cleared ? (
          <Board cards={[]} />
        ) : (
          <Board
            cards={dealt.board}
            revealed={revealed}
            onClick={() => setRevealed((revealed + 1) % 4)}
          />
        )
      ) : null}
      <DealerButton
        onMove={async () => {
          setRevealed(-1);
          await clear(table);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await deal(table);
          setRevealed(0);
        }}
      >
        Dealer
      </DealerButton>
    </div>
  );
}
