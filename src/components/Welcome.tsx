import Link from "next/link";
import { Popup } from "./Popup";

export const description =
  "Looking to play Texas hold ’em and nobody brought cards? Send everyone a link — phones are the hands, the TV is the table, chips stay real.";

export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Popup onClose={onDismiss}>
      <div className="content">
        <h1>♠ Poker Dance 💃</h1>
        <p>{description}</p>
        <button>Start a table</button>
        <p className="learn" onPointerDown={(e) => e.stopPropagation()}>
          <Link href="/learn/hand-rankings">Hand rankings →</Link>
        </p>
      </div>
      <style jsx>{`
        .content {
          text-align: center;
        }
        h1 {
          font-family: var(--font-title);
        }
        button {
          font: inherit;
          font-weight: bold;
          text-transform: uppercase;
          background: black;
          color: white;
          border-radius: 8px;
          border: none;
          padding: 12px 24px;
        }
        .learn {
          margin-bottom: 0;
          font-size: 15px;
          opacity: 0.6;
        }
        .learn :global(a) {
          color: inherit;
          text-underline-offset: 3px;
        }
        @media (prefers-color-scheme: dark) {
          button {
            background: white;
            color: black;
          }
        }
      `}</style>
    </Popup>
  );
}
