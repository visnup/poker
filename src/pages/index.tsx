import { useMutation } from "../../convex/_generated/react";
import { useEffect, useRef, useState } from "react";
import { Board } from "../components/Board";
import { Hole } from "../components/Hole";

function Player({ player }: { player: any }) {
  if (player)
    return (
      <div>
        {player.n}:{player._id.id}
        <style jsx>{`
          div {
            font-size: small;
            position: absolute;
            bottom: 5px;
          }
        `}</style>
      </div>
    );
  return null;
}

export default function Index() {
  const join = useMutation("join");
  const ping = useMutation("ping");
  const [player, setPlayer] = useState<Awaited<ReturnType<typeof join>>>();
  const joining = useRef(false);

  useEffect(() => {
    if (!player && !joining.current) {
      joining.current = true;
      join().then(setPlayer);
    }
  }, [join, player]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player) ping(player._id);
    }, 5e3);
    return () => clearInterval(interval);
  }, [ping, player]);

  if (!player) return null;

  return (
    <main>
      {player.n === 0 ? <Board /> : <Hole player={player} />}
      <Player player={player} />
      <style jsx>
        {`
          main {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
        `}
      </style>
    </main>
  );
}
