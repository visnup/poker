import { useDrag } from "@use-gesture/react";
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
  const [style, api] = useSpring(() => ({ x: 0, y: 0 }));
  const bind = useDrag(({ last, movement, offset: [x, y] }) => {
    api.start({ x, y, immediate: true });
    if (last && Math.hypot(...movement) > 200) onMove();
  });

  return (
    <animated.div style={style}>
      <button {...bind()}>
        {children}
        <style jsx>{`
          button {
            position: absolute;
            touch-action: none;
            font-size: x-large;
            font-weight: bold;
            text-transform: uppercase;
            text-shadow: 0 -1px 0 hsla(0, 0%, 50%, 0.5);
            background: linear-gradient(-25deg, hsl(0, 0%, 85%), white);
            border-radius: 100%;
            border: solid 1px hsl(0, 0%, 90%);
            box-shadow: 2px 4px 10px hsla(0, 0%, 0%, 0.2);
            padding: 0;
            width: 5.5em;
            height: 5.5em;
          }
          @media (prefers-color-scheme: dark) {
            button {
              background: linear-gradient(-25deg, #111, hsl(0, 0%, 15%));
              border: solid 1px hsl(0, 0%, 10%);
            }
          }
        `}</style>
      </button>
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

export function Table() {
  const deal = useMutation("deal");
  const clear = useMutation("clear");
  const dealt = useQuery("getDealt");

  // -1 = cleared, 0 = dealt, 1 = flop, 2 = turn, 3 = river
  const [revealed, setRevealed] = useState(0);

  return (
    <div>
      {dealt ? (
        revealed === -1 || dealt.cleared ? (
          <Board cards={[]} />
        ) : (
          <Board
            cards={dealt.board}
            revealed={revealed}
            onClick={() => setRevealed(revealed + 1)}
          />
        )
      ) : null}
      <DealerButton
        onMove={async () => {
          setRevealed(-1);
          await clear();
          await new Promise((resolve) => setTimeout(resolve, 500));
          await deal();
          setRevealed(0);
        }}
      >
        Dealer
      </DealerButton>
    </div>
  );
}
