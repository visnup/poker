import qrcode from "qrcode-generator";
import { useState } from "react";
import { Popup } from "./Popup";

function Qr({ url }: { url: string }) {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount();
  const modules = [];
  for (let row = 0; row < n; row++)
    for (let col = 0; col < n; col++)
      if (qr.isDark(row, col)) modules.push(`M${col} ${row}h1v1h-1z`);

  return (
    <svg
      className="qr"
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      shapeRendering="crispEdges"
    >
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="white" />
      <path d={modules.join("")} fill="black" />
      <style jsx>{`
        .qr {
          width: 150px;
          height: 150px;
          border-radius: 4px;
        }
      `}</style>
    </svg>
  );
}

export function Help() {
  const [open, setOpen] = useState(false);
  const url = location.origin + location.pathname.replace(/\/0$/, "");

  return (
    <>
      <button className="open" onClick={() => setOpen(true)}>
        ?
      </button>
      <Popup visible={open} onClose={() => setOpen(false)}>
        <dl>
          <dt>Table</dt>
          <dd>
            Move the dealer button to deal.
            <br />
            Tap the board for the flop, turn, and river.
          </dd>
          <dt>Hand</dt>
          <dd>
            Pull down to peek at your cards, all the way to reveal.
            <br />
            Swipe up to fold then tap to un-fold.
          </dd>
          <dt>Join</dt>
          <dd>
            {url}
            <p>
              <Qr url={url} />
            </p>
          </dd>
        </dl>
      </Popup>
      <style jsx>{`
        .open {
          font: inherit;
          background: none;
          border: none;
          padding: 0 4px;
          opacity: 0.5;
          cursor: pointer;
          color: inherit;
        }
        dl {
          margin: 0;
        }
        dt {
          font-weight: bold;
        }
        dd {
          margin: 4px 0 16px;
          line-height: 150%;
        }
      `}</style>
    </>
  );
}
