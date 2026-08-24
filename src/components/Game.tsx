import { useMutation } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { backFor, familyFor } from "../lib/card";
import { useWakeLock } from "../lib/useWakeLock";
import { CardContext } from "./Card";
import { Hand } from "./Hand";
import { Help } from "./Help";
import { Table } from "./Table";

const Player = ({ player }: { player: { seat: number; id: string } }) => (
  <div>
    <span>
      {player.seat}:{player.id.slice(0, 5)}
    </span>
    <Help />
    <style jsx>{`
      div {
        font-size: small;
        position: absolute;
        bottom: 5px;
      }
      span {
        opacity: 0.5;
      }
    `}</style>
  </div>
);

export function Game({ table = "", seat }: { table?: string; seat?: number }) {
  const join = useMutation(api.players.join);
  const ping = useMutation(api.players.ping);
  const [player, setPlayer] = useState<Awaited<ReturnType<typeof join>>>();
  const joining = useRef(false);
  const back = useMemo(
    () => ({ svg: backFor(table), family: familyFor(table) }),
    [table],
  );

  useWakeLock();

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
      else join({ table }).then(setPlayer);
    }
  }, [join, table, player]);

  // Ping
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) ping({ id: player.id as Id<"players"> });
    }, 5e3);
    return () => clearInterval(interval);
  }, [ping, player]);

  if (!player) return null;
  seat ??= player.seat;

  return (
    <main>
      <CardContext.Provider value={back}>
        {seat === 0 ? (
          <Table table={table} />
        ) : (
          <Hand table={table} seat={seat} />
        )}
        <Player player={player} />
      </CardContext.Provider>
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
