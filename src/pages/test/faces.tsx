import { cross } from "d3-array";
import { Card } from "../../components/Card";

const suits = [..."♣♦♥♠"];
const ranks = [..."23456789", "10", ..."JQKA"];
const deck = cross(ranks, suits, (r, s) => r + s);

export default function Test() {
  return (
    <main>
      {deck.slice(0, 26).map((card) => (
        <Card key={card} card={card} anchor="top" rotation={0} revealed />
      ))}
      <style jsx>{`
        main {
          display: flex;
          flex-wrap: wrap;
        }
      `}</style>
    </main>
  );
}
