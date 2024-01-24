import { useState } from "react";
import { cross } from "d3-array";
import { Card } from "../../components/Card";

const suits = [..."♣♦♥♠"];
const ranks = [..."23456789", "10", ..."JQKA"];
const deck = cross(ranks, suits, (r, s) => r + s);

export default function Test() {
  const [revealed, setRevealed] = useState(false);
  const [card, setCard] = useState(0);

  return (
    <main>
      <p>
        <button onClick={() => setRevealed(!revealed)}>reveal</button>
        <button onClick={() => setCard(-1)}>clear</button>
        <button onClick={() => setCard((card + 1) % deck.length)}>
          next card
        </button>
      </p>
      <div className="board">
        {[0, 1].map((i) => (
          <Card key={i} card={deck[card]} revealed={revealed} />
        ))}
        <Card card={deck[card]} revealed={revealed} />
        <Card card={deck[card]} revealed={revealed} />
      </div>
      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        button {
          font-size: large;
          padding: 10px;
          margin: 5px;
        }
        .board {
          display: flex;
        }
      `}</style>
    </main>
  );
}
