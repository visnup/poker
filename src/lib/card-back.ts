import { range } from "d3-array";

// Generated once per module load — stable for the lifetime of the process/bundle.
const margin = 15;
const length = 100;
const width = 250;
const height = 350;

const points = range(0, 300).map(() => [
  Math.random() * width - length / 2,
  Math.random() * (height - 2 * margin) + margin,
  Math.random() + 1,
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
