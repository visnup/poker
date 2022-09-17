import { useQuery, useMutation } from "../../convex/_generated/react";

export function Community() {
  const deal = useMutation("deal");
  const dealt = useQuery("getDealt");
  return (
    <div>
      <div>
        {dealt?.community.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </div>
      <button onClick={() => deal()}>Deal</button>
    </div>
  );
}
