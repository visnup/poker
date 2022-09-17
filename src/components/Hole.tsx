import { useQuery } from "../../convex/_generated/react";

export function Hole({ player }: { player: { n: number } }) {
  const dealt = useQuery("getDealt");
  const cards = dealt?.cards.slice(player.n, player.n + 2) ?? [];
  return (
    <div>
      {cards.map((c) => (
        <div key={c}>{c}</div>
      ))}
    </div>
  );
}
