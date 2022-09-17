import { useQuery } from "../../convex/_generated/react";
import { Card } from "./Card";

export function Hole({ player }: { player: { n: number } }) {
  const dealt = useQuery("getDealt");
  const cards = dealt?.cards.slice(player.n, player.n + 2) ?? [];
  return (
    <div className="cards">
      {cards.map((c) => (
        <div className="card" key={c}>
          <Card key={c} card={c} />
        </div>
      ))}
      <style jsx>
        {`
          .cards {
            position: relative;
          }
          .card + .card {
            position: absolute;
            top: 0;
            left: 50px;
          }
        `}
      </style>
    </div>
  );
}
