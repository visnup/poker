import { Popup } from "./Popup";

export const description =
  "Play Texas hold'em without a deck. Phones are the cards, a shared screen is the table.";

export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Popup onClose={onDismiss}>
      <div className="content">
        <h1>♠ Poker</h1>
        <p>{description}</p>
        <button>Start a table</button>
      </div>
      <style jsx>{`
        .content {
          text-align: center;
        }
        button {
          font: inherit;
          font-weight: bold;
          text-transform: uppercase;
          background: honeydew;
          border-radius: 8px;
          border: none;
          padding: 12px 24px;
        }
        @media (prefers-color-scheme: dark) {
          button {
            background: #444;
            color: #ddd;
          }
        }
      `}</style>
    </Popup>
  );
}
