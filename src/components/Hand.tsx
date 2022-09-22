import { useDrag } from "@use-gesture/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { animated, config, useSpring } from "react-spring";
import { useQuery } from "../../convex/_generated/react";
import { Card } from "./Card";

export function Hand({ seat }: { seat: number }) {
  const dealt = useQuery("getDealt");

  const [rotation, setRotation] = useState(() => Math.random() * 10 - 5);
  useEffect(() => setRotation(Math.random() * 10 - 5), [dealt]);

  const clipPath = (w: number) => ({ clipPath: `circle(${w}px at 10px 20px)` });
  const [revealStyle, revealing] = useSpring(() => ({
    ...clipPath(0),
    config: config.stiff,
  }));
  useEffect(() => revealing.set(clipPath(0)), [revealing, dealt]);
  const [foldStyle, folding] = useSpring(() => ({ y: 0 }));

  const bind = useDrag(
    ({ down, last, swipe: [, sy], movement: [x, y] }) => {
      const h = Math.hypot(x, y);
      if (y > 0) {
        // pull down
        setRotation(2);
        revealing.start(
          down ? { ...clipPath(h), immediate: true } : clipPath(0)
        );
        if (folded) setFolded(false);
      } else if (y < 0) {
        // swipe up
        folding.start({ y, immediate: true });
      }
      if (last) {
        if (y > 0) {
          // pulled down to reveal or reset
          if (h > 250) revealing.start(clipPath(500));
          else setRotation(Math.random());
        } else if (y < 0) {
          // swiped up to fold
          if (sy < 0) setFolded(true);
          folding.start({ y: 0 });
        }
      }
    },
    { swipe: { distance: [25, 25], duration: 125, velocity: 0.25 } }
  );

  const [folded, setFolded] = useState(false);
  useEffect(() => setFolded(false), [dealt]);

  const index = (seat - 1) * 2;
  const cards =
    folded || dealt?.cleared
      ? [undefined, undefined]
      : dealt?.cards.slice(index, index + 2) ?? [];

  return (
    <div className="cards" {...bind()}>
      <Head>
        <meta name="viewport" content="width=380" />
      </Head>
      <animated.div style={foldStyle}>
        {/* <button onClick={() => setFolded(!folded)}>fold</button> */}
        {/* backs */}
        <div className="layer">
          {cards.map((c, i) => (
            <div className="placement" key={i}>
              <Card card={c} anchor="top" rotation={i ? rotation : -rotation} />
            </div>
          ))}
        </div>
        {/* hidden faces */}
        <div className="layer">
          <animated.div style={revealStyle}>
            {cards.map((c, i) => (
              <div className="placement" key={i}>
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
      </animated.div>
      <style jsx>
        {`
          .cards {
            position: relative;
            min-width: 325px;
            min-height: 100vh;
            min-height: -webkit-fill-available;
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
