import { range } from "d3-array";

const margin = 15;
const length = 100;
const width = 250;
const height = 350;

// Seeded so the server and client bundles emit byte-identical SVG; Math.random()
// here renders a different back on each side and hydration discards the server's.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(0x5eed);

const points = range(0, 300).map(() => [
  random() * width - length / 2,
  random() * (height - 2 * margin) + margin,
  random() + 1,
]);

const lines = points
  .map(
    ([x, y, w]) =>
      `  <line x1="${Math.max(x, margin).toFixed(2)}" y1="${y.toFixed(2)}" x2="${Math.min(x + length, width - margin).toFixed(2)}" y2="${y.toFixed(2)}" stroke-width="${w.toFixed(3)}" stroke-opacity="0.5"/>`,
  )
  .join("\n");

export const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <style>
      svg { background-color: white; width: 100%; height: 100%; }
      rect, line { stroke: steelblue; }
      @media (prefers-color-scheme: dark) { svg { background-color: #333; } }
    </style>
    <rect x="${margin}" y="${margin}" width="${width - 2 * margin}" height="${height - 2 * margin}" fill="none" stroke-opacity="0.5" rx="2"/>
    ${lines}
  </svg>
`;
