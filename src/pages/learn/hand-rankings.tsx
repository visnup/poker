import { range } from "d3-array";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Card } from "../../components/Card";
import { dealRanking, rankings } from "../../lib/hands";
import { oddsByPlayers } from "../../lib/odds";

const scale = 0.4;
const overlap = -132; // of a 250px card, so the rank corner of each stays clear
const kicker = 24;
// every row reserves the widest case — five cards with a kicker set apart
const lane = (270 + 3 * (270 + overlap) + (270 + kicker)) * scale;

const oneIn = (n: number) =>
  (n >= 1000 ? Math.round(n) : n).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

function Hand({ made, kickers }: { made: string[]; kickers: string[] }) {
  const cards = [...made, ...kickers];
  const margin = (i: number) =>
    i === 0 ? 0 : i === made.length ? kicker : overlap;
  return (
    <div className="hand">
      <div className="fan">
        {cards.map((card, i) => (
          <Card
            key={card}
            card={card}
            revealed
            rotation={0}
            upsideDown={false}
            style={{ marginLeft: margin(i) }}
          />
        ))}
      </div>
      <style jsx>{`
        .hand {
          height: ${370 * scale}px;
          width: ${lane}px;
        }
        .fan {
          display: flex;
          transform: scale(${scale});
          transform-origin: top left;
        }
      `}</style>
    </div>
  );
}

const streets = ["after the flop", "after the turn", "by the river"];
// a ramp for the rare hands, then real separation for the three that fill the
// grid — and grey for high card, which is the absence of a hand
const shades = [
  "hsl(158 52% 20%)",
  "hsl(158 46% 28%)",
  "hsl(160 43% 36%)",
  "hsl(164 40% 45%)",
  "hsl(169 38% 55%)",
  "hsl(176 34% 65%)",
  "hsl(184 32% 74%)",
  "hsl(146 30% 66%)",
  "hsl(44 46% 72%)",
  "hsl(0 0% 85%)",
];

/** One square per hand out of a hundred, split the way the odds say. Anything
    rarer than a square gets none, which is the honest picture of a royal. */
function squaresFor(players: number, street: number) {
  const share = rankings.map(
    (_, i) => 100 / oddsByPlayers[players - 1][i][street],
  );
  const total = share.reduce((a, b) => a + b, 0);
  const out: number[] = [];
  let carried = 0;
  share.forEach((s, i) => {
    const exact = (s / total) * 100 + carried;
    const n = Math.min(Math.round(exact), 100 - out.length);
    carried = exact - n;
    for (let k = 0; k < n; k++) out.push(i);
  });
  while (out.length < 100) out.push(rankings.length - 1);
  return out;
}

function Hundred({ players }: { players: number }) {
  const [street, setStreet] = useState(2);
  const squares = squaresFor(players, street);
  const counts = rankings.map((_, i) => squares.filter((n) => n === i).length);
  return (
    <figure>
      <figcaption>
        A hundred hands {streets[street]}
        {players > 1 ? `, ${players} at the table` : ""}. Every square is one
        hand.
      </figcaption>
      <div className="grid">
        {squares.map((r, i) => (
          <span
            key={i}
            className="square"
            style={{ background: shades[r] }}
            title={rankings[r].name}
          />
        ))}
      </div>
      <div className="keys">
        {rankings.map(({ name }, i) => (
          <span key={name} className={counts[i] ? "key" : "key gone"}>
            <span className="chip" style={{ background: shades[i] }} />
            {name} <b>{counts[i] || "—"}</b>
          </span>
        ))}
      </div>
      <div className="streets">
        {streets.map((label, i) => (
          <button
            key={label}
            onClick={() => setStreet(i)}
            aria-pressed={i === street}
            className={i === street ? "on" : ""}
          >
            {label}
          </button>
        ))}
      </div>
      <style jsx>{`
        figure {
          margin: 40px 0 0;
          padding-top: 24px;
          border-top: solid 1px hsla(0, 0%, 50%, 0.25);
        }
        figcaption {
          max-width: 34em;
          margin-bottom: 12px;
          opacity: 0.6;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 4px;
          max-width: 330px;
        }
        .square {
          aspect-ratio: 1;
          border-radius: 2px;
          transition: background 0.35s;
        }
        .keys {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 14px;
          margin-top: 14px;
          font-size: 14px;
        }
        .key {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .key.gone {
          opacity: 0.35;
        }
        .chip {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
        b {
          font-variant-numeric: tabular-nums;
        }
        .streets {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .streets button {
          font: inherit;
          font-size: 14px;
          padding: 5px 10px;
          border-radius: 6px;
          border: solid 1px hsla(0, 0%, 50%, 0.35);
          background: none;
          color: inherit;
          cursor: pointer;
        }
        .streets button.on {
          background: hsla(158, 34%, 40%, 0.18);
          border-color: hsla(158, 34%, 40%, 0.5);
        }
      `}</style>
    </figure>
  );
}

function Ranking({ index, players }: { index: number; players: number }) {
  const { name, note } = rankings[index];
  const [deals, setDeals] = useState(0);
  const odds = oddsByPlayers[players - 1][index];
  return (
    <li>
      <button onClick={() => setDeals(deals + 1)}>
        <span className="name">
          {name}
          <span className="again">deal another example</span>
        </span>
        {/* remounts every card, so a repeated one deals in again with the rest */}
        <Hand key={deals} {...dealRanking(index, index * 1e3 + deals)} />
        <span className="right">
          <span className="odds">
            {odds.map((n, i) => (
              <span key={i}>1 in {oneIn(n)}</span>
            ))}
          </span>
          {players === 1 && note && <span className="note">{note}</span>}
        </span>
      </button>
      <style jsx>{`
        li {
          border-top: solid 1px hsla(0, 0%, 50%, 0.25);
        }
        button {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          font: inherit;
          background: none;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          color: inherit;
          cursor: pointer;
          text-align: left;
        }
        button:hover {
          background: hsla(0, 0%, 50%, 0.06);
        }
        .name {
          flex: none;
          width: 140px;
          font-family: var(--font-title);
          font-size: 20px;
        }
        .again {
          display: block;
          font-family: var(--font-script);
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.15s;
        }
        button:hover .again,
        button:focus-visible .again {
          opacity: 0.5;
        }
        .right {
          flex: none;
          margin-left: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .note {
          max-width: 300px;
          text-align: right;
          font-family: var(--font-script);
          font-size: 14px;
          line-height: 1.35;
          opacity: 0.7;
        }
        .odds {
          display: flex;
          font-size: 14px;
          font-variant-numeric: tabular-nums;
          opacity: 0.55;
        }
        .odds span {
          width: 96px;
          text-align: right;
        }
        @media (max-width: 880px) {
          button {
            flex-wrap: wrap;
          }
          .right {
            margin-left: 0;
            align-items: flex-start;
          }
          .note {
            text-align: left;
          }
        }
      `}</style>
    </li>
  );
}

export default function HandRankings() {
  const [players, setPlayers] = useState(1);
  return (
    <main>
      <Head>
        <title>Hand rankings — Poker Dance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <p className="home">
        <Link href="/">♠ Poker Dance</Link> — hold &rsquo;em at a real table,
        without a deck
      </p>
      <h1>Hand rankings</h1>
      <p className="lede">
        Best to worst. Cards set apart don&rsquo;t make the hand — they only
        break ties. Tap a row to deal another example. Odds are exact; a night
        is about thirty hands.
      </p>
      <p className="chooser">
        <label htmlFor="players">Counting</label>{" "}
        <select
          id="players"
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
        >
          <option value={1}>just my hand</option>
          {range(2, 11).map((n) => (
            <option key={n} value={n}>
              {n} players
            </option>
          ))}
        </select>{" "}
        <span className="source">
          {players === 1
            ? "odds are exact"
            : "odds are simulated — hands at a table share a board, so they aren’t independent"}
        </span>
      </p>
      <ol>
        <li className="head">
          <span className="what">
            {players === 1
              ? "how often this is your hand"
              : "how often someone at the table has it"}
          </span>
          <span className="odds">
            <span>after the flop</span>
            <span>after the turn</span>
            <span>by the river</span>
          </span>
        </li>
        {rankings.map(({ name }, i) => (
          <Ranking key={name} index={i} players={players} />
        ))}
      </ol>
      <Hundred players={players} />
      <p className="outro">
        None of these are pictures of cards. They&rsquo;re dealt by the same
        deck <Link href="/">Poker Dance</Link> deals to a room full of phones —
        one screen is the table, everyone else is holding their hand.{" "}
        <Link href="/">Start a table →</Link>
      </p>
      <style jsx>{`
        main {
          max-width: 940px;
          margin: 0 auto;
          padding: 24px;
          overflow: hidden;
        }
        h1 {
          font-family: var(--font-title);
          margin-bottom: 0;
        }
        .lede {
          max-width: 34em;
          opacity: 0.6;
        }
        .chooser {
          font-size: 15px;
        }
        .source {
          opacity: 0.5;
        }
        .chooser select {
          font: inherit;
          font-family: var(--font-title);
          padding: 4px 6px;
          border-radius: 6px;
          border: solid 1px hsla(0, 0%, 50%, 0.4);
          background: none;
          color: inherit;
        }
        .note {
          max-width: 34em;
          font-family: var(--font-script);
          opacity: 0.7;
        }
        .home {
          font-size: 15px;
          opacity: 0.6;
          margin-bottom: 24px;
        }
        .outro {
          max-width: 34em;
          margin-top: 32px;
          padding-top: 20px;
          border-top: solid 1px hsla(0, 0%, 50%, 0.25);
          line-height: 1.5;
        }
        .home :global(a),
        .outro :global(a) {
          color: inherit;
          text-underline-offset: 3px;
        }
        ol {
          list-style: none;
          padding: 0;
        }
        .head {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          padding: 0 14px 4px;
        }
        .what {
          font-size: 13px;
          opacity: 0.45;
        }
        .head .odds {
          margin-left: auto;
          display: flex;
          font-size: 13px;
          opacity: 0.45;
        }
        .head .odds span {
          width: 96px;
          text-align: right;
        }
        @media (max-width: 880px) {
          .head {
            align-items: flex-start;
          }
          .head .odds {
            margin-left: 0;
          }
        }
      `}</style>
    </main>
  );
}
