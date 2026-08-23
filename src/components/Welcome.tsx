export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="overlay" onClick={onDismiss}>
      <div className="card">
        <h1>♠ Poker</h1>
        <p>
          Deal community cards on this screen, then have players join on their
          phones to see their hole cards.
        </p>
        <button onClick={onDismiss}>Start a table</button>
      </div>
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: hsla(0, 0%, 0%, 0.6);
          z-index: 10;
        }
        .card {
          background: honeydew;
          color: black;
          border-radius: 12px;
          padding: 40px;
          max-width: 360px;
          text-align: center;
          box-shadow: 0 10px 40px hsla(0, 0%, 0%, 0.4);
        }
        h1 {
          margin: 0 0 16px;
          font-size: 32px;
        }
        p {
          margin: 0 0 24px;
          line-height: 1.4;
        }
        button {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          background: linear-gradient(-25deg, hsl(0, 0%, 85%), white);
          border-radius: 8px;
          border: solid 1px hsl(0, 0%, 90%);
          box-shadow: 2px 4px 10px hsla(0, 0%, 0%, 0.2);
          color: inherit;
          padding: 12px 24px;
          cursor: pointer;
        }
        @media (prefers-color-scheme: dark) {
          .card {
            background: darkslategray;
            color: white;
          }
          button {
            background: linear-gradient(-25deg, #222, #444);
            color: #ddd;
            border-color: #333;
          }
        }
      `}</style>
    </div>
  );
}
