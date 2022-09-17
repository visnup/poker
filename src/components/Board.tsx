import { useQuery, useMutation } from "../../convex/_generated/react";
import { Card } from "./Card";

export function Board() {
  const deal = useMutation("deal");
  const dealt = useQuery("getDealt");

  if (!dealt) return <button onClick={() => deal()}>Deal</button>;

  const { board } = dealt;
  const flop = board.slice(0, 3);
  const turn = board[3];
  const river = board[4];

  return (
    <div>
      <div className="board">
        <div className="flop">
          {flop.map((c, i) => (
            <Card
              key={c}
              card={c}
              style={{ transform: `translateX(-${i * 130}px)` }}
            />
          ))}
        </div>
        <Card card={turn} />
        <Card card={river} />
      </div>
      <button onClick={() => deal()}>Deal</button>
      <style jsx>
        {`
          .board {
            display: flex;
            padding: 20px;
          }
          .flop {
            display: flex;
            margin-right: -200px;
          }
        `}
      </style>
    </div>
  );
}
