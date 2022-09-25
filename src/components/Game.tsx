import { useMutation } from "../../convex/_generated/react";
import { useEffect, useRef, useState } from "react";
import { Table } from "./Table";
import { Hand } from "./Hand";

const Player = ({ player }: { player: { seat: number; id: string } }) => (
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

export function Game({ table = "", seat }: { table?: string; seat?: number }) {
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
      if (stored && stored.table === table) setPlayer(stored);
      else join(table).then(setPlayer);
    }
  }, [join, table, player]);

  // Ping
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) ping(player.id);
    }, 5e3);
    return () => clearInterval(interval);
  }, [ping, player]);

  if (!player) return null;
  seat ??= player.seat;

  return (
    <main>
      {seat === 0 ? (
        <Table table={table} />
      ) : (
        <Hand table={table} seat={seat} />
      )}
      <Player player={player} />
      <style jsx>
        {`
          main {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        `}
      </style>
    </main>
  );
}
