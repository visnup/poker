import { range } from "d3-array";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { dealRanking, noteFor, rankings } from "../../lib/hands";
import { oddsByPlayers } from "../../lib/odds";
import { randomWord } from "../../lib/words";

const scale = 0.4;
const overlap = -132; // of a 250px card, so the rank corner of each stays clear
const kicker = 20;
// every row reserves the widest case — five cards with a kicker set apart
const lane = (270 + 3 * (270 + overlap) + (270 + kicker)) * scale;

const oneIn = (n: number) =>
  (n >= 1000 ? Math.round(n) : n).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

function Hand({
  made,
  kickers,
  dealt,
}: {
  made: string[];
  kickers: string[];
  dealt: boolean;
}) {
  const cards = [...made, ...kickers];
  const margin = (i: number) =>
    i === 0 ? 0 : i === made.length ? kicker : overlap;
  return (
    <div className="hand">
      <div className={dealt ? "fan" : "fan out"}>
        {cards.map((card, i) => (
          <Card
            key={card}
            card={card}
            revealed={dealt}
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
          transition:
            transform 420ms cubic-bezier(0.4, 0, 1, 1),
            opacity 420ms;
        }
        .fan.out {
          /* scaled, so this leaves the screen at any width */
          transform: scale(${scale}) translateX(-200vw);
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

function Ranking({ index, players }: { index: number; players: number }) {
  const { name } = rankings[index];
  const [{ deals, dealt }, setDeal] = useState({ deals: 0, dealt: true });
  const odds = oddsByPlayers[players - 1][index];
  const note = noteFor(index, players);
  // the old hand flies off before the next one is dealt, the way the table does
  useEffect(() => {
    if (dealt) return;
    const t = setTimeout(
      () => setDeal((d) => ({ deals: d.deals + 1, dealt: true })),
      500,
    );
    return () => clearTimeout(t);
  }, [dealt]);
  return (
    <li>
      <button onClick={() => setDeal((d) => ({ ...d, dealt: false }))}>
        <span className="name">
          {name}
          <span className="again">deal another example</span>
        </span>
        {/* remounts every card, so a repeated one deals in again with the rest */}
        <Hand
          key={deals}
          dealt={dealt}
          {...dealRanking(index, index * 1e3 + deals)}
        />
        <span className="right">
          <span className="odds">
            {odds.map((n, i) => (
              <span key={i}>
                1 in {oneIn(n)}
                {/* filled to the real share, so the rare ones read as empty */}
                <span className="bar">
                  <span style={{ width: `${100 / n}%` }} />
                </span>
              </span>
            ))}
          </span>
          {note && <span className="note">{note}</span>}
        </span>
      </button>
      <style jsx>{`
        :global(body) {
          background-color: honeydew;
        }
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
        .odds > span {
          width: 96px;
          text-align: right;
        }
        .bar {
          display: flex;
          justify-content: flex-end;
          width: 76px;
          height: 4px;
          margin: 4px 0 0 auto;
          border-radius: 2px;
          background: hsla(0, 0%, 0%, 0.16);
          overflow: hidden;
        }
        .bar > span {
          width: auto;
          height: 100%;
          background: currentColor;
        }
        @media (prefers-color-scheme: dark) {
          .bar {
            background: hsla(0, 0%, 100%, 0.22);
          }
        }
        @media (max-width: 880px) {
          button {
            flex-wrap: wrap;
          }
          .again {
            display: none;
          }
          .name,
          .right {
            padding-left: 10px;
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
  // picked after mount: a word chosen while rendering wouldn't survive hydration
  const [table, setTable] = useState("/");
  useEffect(() => setTable(`/${randomWord()}`), []);
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
        Best to worst. Cards set apart don&rsquo;t make the hand, but they break
        ties. Tap a row to deal another example. A night is about thirty hands.
      </p>
      <p className="chooser">
        <label htmlFor="players">Consider</label>{" "}
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
          (odds are {players === 1 ? " exact" : " simulated and dependent"})
        </span>
      </p>
      <ol>
        <li className="head">
          <span className="what">
            {players === 1
              ? "how often this is your hand"
              : "how often someone at the table has one"}
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
      <p className="outro">
        Learning these for poker night? If you&rsquo;re playing in person, skip
        the shuffling and play here on <Link href="/">Poker Dance</Link>.{" "}
        <Link href={table}>Start a table →</Link>
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
        .head .odds > span {
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
          /* out past the page padding, so the cards get the whole screen */
          ol {
            margin-left: -24px;
            margin-right: -24px;
          }
          .head {
            padding-left: 24px;
          }
        }
      `}</style>
    </main>
  );
}
