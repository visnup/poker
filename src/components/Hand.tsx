import { useDrag } from "@use-gesture/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { animated, config, useSpring } from "react-spring";
import { useQuery } from "../../convex/_generated/react";
import { Card } from "./Card";

const slow = { ...config.slow, precision: 0.0001 };
export function Hand({ table, seat }: { table: string; seat: number }) {
  const dealt = useQuery("getDealt", table);

  const [rotation, setRotation] = useState(() => Math.random() * 10 - 5);
  useEffect(() => setRotation(Math.random() * 10 - 5), [dealt]);

  const clipPath = (w: number) => ({ clipPath: `circle(${w}px at 10px 20px)` });
  const [revealStyle, revealing] = useSpring(() => ({
    ...clipPath(0),
    config: { ...config.stiff, clamp: true },
  }));
  useEffect(() => revealing.set(clipPath(0)), [revealing, dealt]);
  const [foldStyle, folding] = useSpring(() => ({ y: 0 }));
  useEffect(() => {
    if (!dealt?.cleared) folding.set({ y: 0 });
  }, [folding, dealt]);

  const bind = useDrag(({ down, last, velocity: [, vy], movement: [x, y] }) => {
    const h = Math.hypot(x, y);
    if (y >= 0) {
      // pull down
      setRotation(2);
      revealing.start(clipPath(down ? h : 0));
      folding.start({ y: 0, config: slow });
    } else if (y < 0) {
      // swipe up
      revealing.start(clipPath(0));
      folding.start({ y, immediate: true });
    }
    if (last) {
      if (y >= 0) {
        // pulled down to reveal or reset
        if (h > 250) revealing.start(clipPath(500));
        else setRotation(Math.random());
      } else if (y < 0) {
        // swiped up to fold or reset
        if (vy > 1 || h > 250)
          folding.start({
            y: -1000,
            config: { velocity: -vy, tension: 1, friction: 1, clamp: true },
          });
        else folding.start({ y: 0, config: slow });
      }
    }
  });

  const index = (seat - 1) * 2;
  const cards = dealt?.cleared
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
