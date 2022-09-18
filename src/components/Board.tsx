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

  function onPointerDown({ clientX, clientY }: React.PointerEvent) {
    setStart([clientX, clientY]);
  }
  function onPointerUp({ clientX, clientY }: React.PointerEvent) {
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
          background-color: white;
          color: black;
          border-radius: 100%;
          border: none;
          box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.2);
          width: 4em;
          height: 4em;
        }
      `}</style>
    </button>
  );
}

export function Board() {
  const deal = useMutation("deal");
  const dealt = useQuery("getDealt");

  const [revealed, setRevealed] = useState(0);
  const offscreen =
    revealed === -1
      ? { style: { transform: "translateX(-200vw)" } }
      : { style: { transform: "translateX(0)" } };

  if (!dealt) return <button onClick={() => deal()}>Deal</button>;

  const { board } = dealt;
  const flop = board.slice(0, 3);
  const turn = board[3];
  const river = board[4];

  return (
    <div>
      <div
        className="board"
        onClick={() => setRevealed(revealed + 1)}
        {...offscreen}
      >
        <div className="flop">
          {flop.map((c, i) => (
            <Card
              key={c}
              card={c}
              style={{ transform: `translateX(-${i * 60}%)` }}
              revealed={revealed > 0}
            />
          ))}
        </div>
        <Card key={turn} card={turn} revealed={revealed > 1} />
        <Card key={river} card={river} revealed={revealed > 2} />
      </div>
      <DealerButton
        onMove={async () => {
          setRevealed(-1);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          deal();
          setRevealed(0);
        }}
      >
        Dealer
      </DealerButton>
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
