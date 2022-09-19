import { useGesture } from "@use-gesture/react";
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
  const [styles, api] = useSpring(() => ({ x: 0, y: 0 }));
  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      api.start({ x, y, immediate: true });
    },
    onDragEnd: ({ movement }) => {
      if (Math.hypot(...movement) > 200) onMove();
    },
  });

  return (
    <animated.div {...bind()} style={styles}>
      <button>
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
            color: black;
            border-radius: 100%;
            border: solid 1px hsl(0, 0%, 90%);
            box-shadow: 2px 4px 10px hsla(0, 0%, 0%, 0.2);
            padding: 0;
            width: 5.5em;
            height: 5.5em;
          }
        `}</style>
      </button>
    </animated.div>
  );
}

function Board({
  board,
  revealed = 0,
  ...props
}: { board: string[]; revealed?: number } & JSX.IntrinsicElements["div"]) {
  const flop = board.slice(0, 3);
  const turn = board[3];
  const river = board[4];

  return (
    <div className="board" {...props}>
      <div className="flop">
        <Card card={flop[0]} revealed={revealed > 0} />
        <Card
          card={flop[1]}
          revealed={revealed > 0}
          style={{ marginLeft: "-60%" }}
        />
        <Card
          card={flop[2]}
          revealed={revealed > 0}
          style={{ marginLeft: "-120%" }}
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
            margin-right: -300px;
          }
        `}
      </style>
    </div>
  );
}

export function Table() {
  const deal = useMutation("deal");
  const dealt = useQuery("getDealt");

  // -1 = undealt, 0 = dealt, 1 = flop, 2 = turn, 3 = river
  const [revealed, setRevealed] = useState(0);

  return (
    <div>
      {revealed === -1 ? (
        <Board board={[]} />
      ) : dealt ? (
        <Board
          board={dealt.board}
          revealed={revealed}
          onClick={() => setRevealed(revealed + 1)}
        />
      ) : null}
      <DealerButton
        onMove={() => {
          setRevealed(-1);
          deal().then(() => setRevealed(0));
        }}
      >
        Dealer
      </DealerButton>
    </div>
  );
}
