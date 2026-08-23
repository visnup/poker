export const description =
  "Play Texas hold'em without a deck. Phones are the cards, a shared screen is the table.";

export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="overlay" onClick={onDismiss}>
      <div className="card">
        <h1>♠ Poker</h1>
        <p>{description}</p>
        <button>Start a table</button>
      </div>
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: hsla(0, 0%, 0%, 0.5);
        }
        .card {
          background: honeydew;
          border-radius: 12px;
          padding: 40px;
          max-width: 320px;
          text-align: center;
        }
        button {
          font: inherit;
          font-weight: bold;
          text-transform: uppercase;
          background: white;
          border-radius: 8px;
          border: none;
          padding: 12px 24px;
        }
        @media (prefers-color-scheme: dark) {
          .card {
            background: darkslategray;
          }
          button {
            background: #444;
            color: #ddd;
          }
        }
      `}</style>
    </div>
  );
}
