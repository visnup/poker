import { useGesture } from "@use-gesture/react";
import { useEffect, useState } from "react";
import { animated, useSpring, config } from "react-spring";
import { useQuery } from "../../convex/_generated/react";
import { Card } from "./Card";

export function Hole({ seat }: { seat: number }) {
  const dealt = useQuery("getDealt");
  const [rotation, setRotation] = useState(() => Math.random() * 10 - 5);
  useEffect(() => setRotation(Math.random() * 10 - 5), [dealt]);
  const [styles, api] = useSpring(() => ({
    clipPath: "circle(0% at 10px 20px)",
    config: config.stiff,
  }));
  const bind = useGesture({
    onDragStart: () => setRotation(2),
    onDragEnd: () => setRotation(Math.random()),
    onDrag: ({ down, movement }) => {
      const width = down ? Math.hypot(...movement) : 0;
      api.start({ clipPath: `circle(${width}px at 10px 20px)` });
    },
  });

  const cards = dealt?.cards.slice(seat, seat + 2) ?? [];

  return (
    <div className="cards" {...bind()}>
      <div className="layer">
        {cards.map((c, i) => (
          <div className="placement" key={c}>
            <Card card={c} anchor="top" rotation={i ? rotation : -rotation} />
          </div>
        ))}
      </div>
      <div className="layer">
        <animated.div style={styles}>
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
        </animated.div>
      </div>
      <style jsx>
        {`
          .cards {
            position: relative;
            min-width: 325px;
            min-height: 100vh;
            touch-action: none;
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
