import { useQuery, useMutation } from "../../convex/_generated/react";
import { Card } from "./Card";

export function Community() {
  const deal = useMutation("deal");
  const dealt = useQuery("getDealt");

  if (!dealt) return null;
  const { community } = dealt;
  const flop = community.slice(0, 3);
  const turn = community[3];
  const river = community[4];

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
