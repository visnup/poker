import { ReactNode, useRef, useState } from "react";
import { useQuery, useMutation } from "../../convex/_generated/react";
import { Card } from "./Card";

function DealerButton({
  onMove,
  children,
}: {
  onMove: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [start, setStart] = useState<number[] | undefined>();
  const [location, setLocation] = useState({ top: 30, left: 30 });

  function onPointerDown({
    target,
    pointerId,
    clientX,
    clientY,
  }: React.PointerEvent) {
    (target as Element).setPointerCapture(pointerId);
    setStart([clientX, clientY]);
  }
  function onPointerUp({
    target,
    pointerId,
    clientX,
    clientY,
  }: React.PointerEvent) {
    (target as Element).releasePointerCapture(pointerId);
    if (start) {
      const distance = Math.hypot(clientX - start[0], clientY - start[1]);
      if (distance > 200) onMove();
    }
    setStart(undefined);
  }
  function onPointerMove(event: React.PointerEvent) {
    if (start)
      setLocation({
        top: event.clientY - ref.current!.offsetHeight / 2,
        left: event.clientX - ref.current!.offsetWidth / 2,
      });
  }

  return (
    <button
      style={location}
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      {children}
      <style jsx>{`
        button {
          position: absolute;
          font-size: xx-large;
          background: linear-gradient(-25deg, hsl(0, 0%, 90%), white);
          color: black;
          border-radius: 100%;
          border: solid 1px hsl(0, 0%, 95%);
          box-shadow: 0 2px 10px hsla(0, 0%, 0%, 0.2);
          padding: 0;
          width: 4em;
          height: 4em;
          touch-action: none;
        }
      `}</style>
    </button>
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
