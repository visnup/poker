import { useEffect, useState } from "react";
import { useQuery } from "../../convex/_generated/react";
import { Card } from "./Card";
import { useDrag } from "./useDrag";

export function Hole({ player }: { player: { n: number } }) {
  const dealt = useQuery("getDealt");
  const [distance, direction] = useDrag();
  const [rotation, setRotation] = useState(() => Math.random() * 10 - 5);
  useEffect(() => setRotation(Math.random() * 10 - 5), [dealt]);

  const cards = dealt?.cards.slice(player.n, player.n + 2) ?? [];

  return (
    <div className="cards">
      <div className="layer">
        {cards.map((c, i) => (
          <div className="placement" key={c}>
            <Card card={c} anchor="top" rotation={i ? rotation : -rotation} />
          </div>
        ))}
      </div>
      <div
        className="layer"
        style={{ clipPath: `circle(${distance}% at 40px 30px)` }}
      >
        {cards.map((c, i) => (
          <div className="placement" key={c}>
            <Card
              card={c}
              anchor="top"
              rotation={i ? rotation : -rotation}
              revealed
            />
          </div>
        ))}
      </div>
      <style jsx>
        {`
          .cards {
            position: relative;
            min-width: 325px;
            min-height: 100vh;
          }
          .layer {
            position: absolute;
            width: 100%;
            top: 20vh;
          }
          .placement {
            position: absolute;
          }
          .placement + .placement {
            left: 50px;
          }
        `}
      </style>
    </div>
  );
}
