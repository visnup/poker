import { deck } from "../../../convex/deals";
import { Card } from "../../components/Card";

export default function Test() {
  return (
    <main>
      {deck.map((card) => (
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
