import { useState } from "react";
import { Board } from "../../components/Table";
import { deck } from "../../../convex/deals";

const CARDS = deck.slice(0, 5);

export default function Test() {
  const [revealed, setRevealed] = useState(0);
  return (
    <div>
      <p data-testid="revealed">{revealed}</p>
      <Board
        cards={CARDS}
        revealed={revealed}
        onClick={() => setRevealed((r) => (r + 1) % 4)}
      />
    </div>
  );
}
