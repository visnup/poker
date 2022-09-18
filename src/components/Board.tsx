import { useEffect, useState } from "react";
import { useQuery, useMutation } from "../../convex/_generated/react";
import { Card } from "./Card";

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
      <button
        onClick={async () => {
          setRevealed(-1);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          deal();
          setRevealed(0);
        }}
      >
        Deal
      </button>
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
