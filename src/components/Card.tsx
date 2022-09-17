import { useState } from "react";

export function Card({
  card,
  ...props
}: { card: string } & JSX.IntrinsicElements["div"]) {
  const [rotation] = useState(() => Math.random() * 10 - 5);
  const [n, suit] = [
    card.slice(0, card.length - 1),
    card.slice(card.length - 1),
  ];
  const color = suit === "♣" || suit === "♠" ? "black" : "red";

  return (
    <div className="area" style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="card" {...props}>
        <div className="corner">
          <div>{n}</div>
          <div>{suit}</div>
        </div>
        <div className="corner">
          <div>{n}</div>
          <div>{suit}</div>
        </div>
        <style jsx>
          {`
            .card {
              color: ${color};
              font-size: x-large;
              background: white;
              border: solid 1px hsla(0, 0%, 0%, 0.1);
              border-radius: 3px;
              box-shadow: 0 0 10px hsla(0, 0%, 50%, 0.2);
              width: 250px;
              height: 350px;
              position: relative;
              margin: 10px;
              user-select: none;
            }

            .corner {
              text-align: center;
              position: absolute;
              padding: 10px;
            }
            .corner + .corner {
              right: 0;
              bottom: 0;
              transform: rotate(180deg);
            }
          `}
        </style>
      </div>
    </div>
  );
}
