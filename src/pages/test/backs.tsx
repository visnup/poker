import { useState } from "react";
import {
  allBacks,
  hash,
  Palette,
  paletteFor,
  palettes,
} from "../../lib/card-back";
import { randomWord } from "../../lib/words";

export default function Test() {
  const [table, setTable] = useState("raven");
  const [palette, setPalette] = useState<Palette | "">("");
  const seed = hash(table);

  return (
    <main>
      <p>
        <label>
          table{" "}
          <input value={table} onChange={(e) => setTable(e.target.value)} />
        </label>
        <button onClick={() => setTable(randomWord())}>random</button>
        <select
          value={palette}
          onChange={(e) => setPalette(e.target.value as Palette | "")}
        >
          <option value="">seeded ({paletteFor(seed)})</option>
          {Object.keys(palettes).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <code>hash = {seed}</code>
      </p>
      <div className="row">
        {Object.entries(allBacks).map(([name, back]) => (
          <figure key={name}>
            <div
              className="card"
              data-testid={name}
              dangerouslySetInnerHTML={{
                __html: back(
                  seed,
                  palette || undefined,
                  `https://poker.dance/${table}`,
                ),
              }}
            />
            <figcaption>{name}</figcaption>
          </figure>
        ))}
      </div>
      <style jsx>{`
        main {
          padding: 20px;
          font-family: sans-serif;
        }
        p {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        input,
        button,
        select {
          font-size: large;
          padding: 5px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        figure {
          margin: 0;
        }
        .card {
          width: 250px;
          height: 350px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.2);
          line-height: 0;
        }
        figcaption {
          font-size: small;
          padding-top: 8px;
          opacity: 0.6;
        }
      `}</style>
    </main>
  );
}
