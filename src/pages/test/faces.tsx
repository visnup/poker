import { deck } from "../../../convex/deck";
import { Card } from "../../components/Card";

export default function Test() {
  return (
    <main>
      {deck.flatMap((card) =>
        [false, true].map((flipped) => (
          <Card
            key={`${card}-${flipped}`}
            card={card}
            anchor="top"
            rotation={0}
            revealed
            upsideDown={flipped}
          />
        )),
      )}
      <style jsx>{`
        main {
          display: flex;
          flex-wrap: wrap;
        }
      `}</style>
    </main>
  );
}
