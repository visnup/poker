import { Card } from "../../components/Card";

const suits = [..."♣♦♥♠"];
const ranks = [..."23456789", "10", ..."JQKA"];
const deck = suits.flatMap((s) => ranks.map((d) => d + s));

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
