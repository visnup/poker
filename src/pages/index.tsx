import { useMutation } from "../../convex/_generated/react";
import { useEffect, useRef, useState } from "react";
import { Table } from "../components/Table";
import { Hand } from "../components/Hand";

function Player({ player }: { player: { seat: number; id: string } }) {
  if (player)
    return (
      <div>
        {player.seat}:{player.id.slice(0, 5)}
        <style jsx>{`
          div {
            font-size: small;
            position: absolute;
            bottom: 5px;
            opacity: 0.5;
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

  // Sync player with sessionStorage
  useEffect(() => {
    if (player) sessionStorage.setItem("player", JSON.stringify(player));
  }, [player]);

  // Setup player
  useEffect(() => {
    if (!player && !joining.current) {
      joining.current = true;
      const stored = JSON.parse(sessionStorage.getItem("player") || "null");
      if (stored) setPlayer(stored);
      else join().then(setPlayer);
    }
  }, [join, player]);

  // Ping
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) ping(player.id);
    }, 5e3);
    return () => clearInterval(interval);
  }, [ping, player]);

  if (!player) return null;

  return (
    <main>
      {player.seat === 0 ? <Table /> : <Hand seat={player.seat} />}
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
