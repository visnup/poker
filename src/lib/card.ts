import { range } from "d3-array";
import qrcode from "qrcode-generator";

const width = 250;
const height = 350;
const margin = 15;

// Seeded so the server and client bundles emit byte-identical SVG; Math.random()
// here renders a different back on each side and hydration discards the server's.
export function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a, so a table name is a seed. */
export function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

type Random = () => number;
const between = (random: Random, lo: number, hi: number) =>
  lo + random() * (hi - lo);
const oneOf = <T>(random: Random, xs: readonly T[]) =>
  xs[Math.floor(random() * xs.length) % xs.length];

/** [ink, paper] in light, then the same pair in dark. */
export const palettes = {
  steelblue: ["steelblue", "#ffffff", "steelblue", "#333333"],
  navy: ["#22314f", "#f4efe2", "#9db2d6", "#20242c"],
  claret: ["#8c2f39", "#faf6f2", "#d98c92", "#241b1c"],
  felt: ["#2f6b4f", "#f6f7f2", "#79b394", "#1c2420"],
  ochre: ["#a8791f", "#faf5ea", "#d7ac5c", "#26221a"],
  graphite: ["#2b2f36", "#f7f7f5", "#a9b0ba", "#232528"],
} satisfies Record<string, [string, string, string, string]>;
export type Palette = keyof typeof palettes;
const names = Object.keys(palettes) as Palette[];
export const paletteFor = (seed: number) => names[seed % names.length];

const box = `x="${margin}" y="${margin}" width="${width - 2 * margin}" height="${height - 2 * margin}" rx="2"`;

const frame = (
  key: string,
  palette: Palette,
  body: string,
  defs = "",
  lightOnly = false,
) => {
  const [ink, paper, darkInk, darkPaper] = palettes[palette];
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <style>
      svg { background-color: ${paper}; width: 100%; height: 100%; }
      .ink { stroke: ${ink}; fill: none; stroke-opacity: 0.5; }
      .solid { fill: ${ink}; stroke: none; }
      ${lightOnly ? "" : `@media (prefers-color-scheme: dark) { svg { background-color: ${darkPaper}; } .ink { stroke: ${darkInk}; } }`}
    </style>
    <defs>${defs}<clipPath id="${key}-box"><rect ${box}/></clipPath></defs>
    <g clip-path="url(#${key}-box)">${body}</g>
    <rect class="ink" ${box}/>
  </svg>
`;
};

/** The eight symmetries of the square, applied about (cx, cy). */
const d4 = (cx: number, cy: number, content: string) =>
  [0, 90, 180, 270]
    .flatMap((a) =>
      [1, -1].map(
        (m) =>
          `<g transform="translate(${cx} ${cy}) rotate(${a}) scale(${m} 1) translate(${-cx} ${-cy})">${content}</g>`,
      ),
    )
    .join("");

// A tile *center* lands on the card center, so cropping 5:7 out of the infinite
// p4m field still leaves both mirrors and the 180° rotation the deal relies on.
const mod = (a: number, n: number) => ((a % n) + n) % n;
const tiled = (
  id: string,
  palette: Palette,
  s: number,
  wedge: string,
  invariant = "",
) =>
  frame(
    id,
    palette,
    `<rect width="${width}" height="${height}" fill="url(#${id})"/>`,
    `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s}" height="${s}" x="${mod(width / 2 - s / 2, s).toFixed(2)}" y="${mod(height / 2 - s / 2, s).toFixed(2)}">${invariant}${d4(s / 2, s / 2, wedge)}</pattern>`,
  );

/** Sol LeWitt's four directions: a quadrant of hatched cells, mirrored out. */
function lewitt(seed: number, palette: Palette = paletteFor(seed)) {
  const random = mulberry32(seed);
  const cell = 25;
  const n = Math.round(between(random, 5, 7));
  const weight = between(random, 0.6, 0.9);
  const d = cell / n;
  const angles = [0, 90, 45, 135];
  const hatch = angles
    .map(
      (a, i) =>
        `<pattern id="hatch${i}" patternUnits="userSpaceOnUse" width="${d}" height="${d}" patternTransform="translate(${width / 2} ${height / 2}) rotate(${a - 90})"><line class="ink" x1="0" y1="0" x2="0" y2="${d}" stroke-width="${weight.toFixed(2)}"/></pattern>`,
    )
    .join("");

  const cols = width / cell;
  const rows = height / cell;
  const q = range(0, rows / 2).map(() =>
    range(0, cols / 2).map(() => Math.floor(random() * 4)),
  );
  const cells = range(0, rows)
    .flatMap((r) =>
      range(0, cols).map((c) => {
        const a =
          angles[q[Math.min(r, rows - 1 - r)][Math.min(c, cols - 1 - c)]];
        // reflection sends θ to 180−θ; two reflections is a 180° turn, i.e. identity
        const flipped = r >= rows / 2 !== c >= cols / 2;
        const i = angles.indexOf(flipped ? (180 - a) % 180 : a);
        return `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="url(#hatch${i})"/>`;
      }),
    )
    .join("");
  return frame("lewitt", palette, cells, hatch);
}

/** Two offset families of concentric circles; the interference is the pattern. */
function moire(seed: number, palette: Palette = paletteFor(seed)) {
  const random = mulberry32(seed);
  const step = between(random, 4.5, 8);
  const offset = between(random, 22, 48);
  const weight = between(random, 0.6, 0.95);
  const maxR = Math.hypot(width / 2, height / 2 + offset);
  const rings = (dy: number) =>
    range(step, maxR, step)
      .map(
        (r) =>
          `<circle cx="${width / 2}" cy="${(height / 2 + dy).toFixed(2)}" r="${r.toFixed(2)}"/>`,
      )
      .join("");
  return frame(
    "moire",
    palette,
    `<g class="ink" stroke-width="${weight.toFixed(2)}">${rings(-offset)}${rings(offset)}</g>`,
  );
}

/** Khatam: two squares 45° apart make the eight-point star, crosses at the corners. */
function khatam(seed: number, palette: Palette = paletteFor(seed)) {
  const random = mulberry32(seed);
  const s = oneOf(random, [50, 62.5, 87.5]);
  const c = s / 2;
  const a = c * between(random, 0.4, 0.56);
  const tip = a * Math.SQRT2;
  const cross = c * between(random, 0.2, 0.34);
  const square = `<rect class="ink" x="${(c - a).toFixed(2)}" y="${(c - a).toFixed(2)}" width="${(2 * a).toFixed(2)}" height="${(2 * a).toFixed(2)}"/>`;
  const star = square + `<g transform="rotate(45 ${c} ${c})">${square}</g>`;
  const arm = `<line class="ink" x1="${c}" y1="${(c - tip).toFixed(2)}" x2="${c}" y2="0"/>`;
  const spoke = `<line class="ink" x1="${(c + a).toFixed(2)}" y1="${(c - a).toFixed(2)}" x2="${(s - cross / Math.SQRT2).toFixed(2)}" y2="${(cross / Math.SQRT2).toFixed(2)}"/>`;
  const corner = `<rect class="ink" x="${(s - cross).toFixed(2)}" y="${(-cross).toFixed(2)}" width="${(2 * cross).toFixed(2)}" height="${(2 * cross).toFixed(2)}" transform="rotate(45 ${s} 0)"/>`;
  return tiled("khatam", palette, s, arm + spoke + corner, star);
}

/** Guilloché: r = R + A·cos(nθ), so the rosette carries D4 the way a banknote does. */
function guilloche(seed: number, palette: Palette = paletteFor(seed)) {
  const random = mulberry32(seed);
  const n = oneOf(random, [8, 12, 16, 20]);
  const count = Math.round(between(random, 9, 15));
  const outer = between(random, 72, 90);
  const braid = between(random, 0.9, 1.9);
  const cx = width / 2;
  const cy = height / 2;
  const arc = (R: number, A: number) =>
    "M" +
    range(0, 31)
      .map((i) => {
        const t = ((i * 1.5) / 180) * Math.PI;
        const r = R + A * Math.cos(n * t);
        return `${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`;
      })
      .join("L");

  const defs: string[] = [];
  const body: string[] = [];
  // only the eight <use> copies draw; the source path stays in <defs> so the
  // first 45° wedge isn't inked twice
  const family = (
    key: string,
    r0: number,
    r1: number,
    rings: number,
    a: number,
  ) =>
    range(0, rings).forEach((k) => {
      const id = `guilloche-${key}${k}`;
      const R = r0 + ((r1 - r0) * k) / (rings - 1);
      defs.push(
        `<path id="${id}" class="ink" d="${arc(R, (k % 2 ? 1 : -1) * a * ((r1 - r0) / rings))}"/>`,
      );
      body.push(d4(cx, cy, `<use href="#${id}"/>`));
    });

  family("m", 20, outer, count, braid);
  family("f", outer + 14, 205, Math.round((191 - outer) / 6), 0.55);
  return frame(
    "guilloche",
    palette,
    `<g stroke-width="0.8">${body.join("")}</g>`,
    defs.join(""),
  );
}

/** Truchet quarter-arcs, random in one quadrant and mirrored out — pmm, not p4m. */
function truchet(seed: number, palette: Palette = paletteFor(seed)) {
  const random = mulberry32(seed);
  const u = oneOf(random, [12.5, 25]);
  const weight = between(random, 0.9, 2.2);
  const bias = between(random, 0.35, 0.65);
  const cols = width / u;
  const rows = height / u;
  const q = range(0, rows / 2).map(() =>
    range(0, cols / 2).map(() => random() > bias),
  );
  const h = u / 2;
  const cells = range(0, rows)
    .flatMap((r) =>
      range(0, cols).map((col) => {
        const flip =
          (q[Math.min(r, rows - 1 - r)][Math.min(col, cols - 1 - col)] !==
            r >= rows / 2) !==
          col >= cols / 2;
        const x = col * u;
        const y = r * u;
        return flip
          ? `<path d="M${x + h} ${y}A${h} ${h} 0 0 0 ${x} ${y + h}M${x + u} ${y + h}A${h} ${h} 0 0 0 ${x + h} ${y + u}"/>`
          : `<path d="M${x + h} ${y}A${h} ${h} 0 0 1 ${x + u} ${y + h}M${x} ${y + h}A${h} ${h} 0 0 1 ${x + h} ${y + u}"/>`;
      }),
    )
    .join("");
  return frame(
    "truchet",
    palette,
    `<g class="ink" stroke-width="${weight.toFixed(2)}">${cells}</g>`,
  );
}

/** The table's join URL, tiled: the back of the card is the invitation, and
    any one of the codes scans. Stays light in dark mode — inverted QR codes
    don't reliably scan. */
function qr(
  seed: number,
  palette: Palette = paletteFor(seed),
  url = "https://poker.dance",
) {
  const code = qrcode(0, "H");
  code.addData(url);
  code.make();
  const n = code.getModuleCount();
  const modules = [];
  for (let row = 0; row < n; row++)
    for (let col = 0; col < n; col++)
      if (code.isDark(row, col)) modules.push(`M${col} ${row}h1v1h-1z`);

  const cols = 2;
  const rows = 3;
  const cw = (width - 2 * margin) / cols;
  const ch = (height - 2 * margin) / rows;
  // 2 modules of quiet zone rather than the spec's 4; the gutter between tiles
  // and the card's paper margin supply the rest
  const scale = Math.min(cw, ch) / (n + 4);
  const side = scale * n;
  // a code's three finders sit TL/TR/BL, so the bare corner points at the card
  // center; opposite tiles differ by 180°, which makes the whole back 2-fold
  const turns = [
    [0, 90],
    [0, 180],
    [270, 180],
  ];
  const tiles = range(0, rows)
    .flatMap((r) =>
      range(0, cols).map((c) => {
        const x = margin + c * cw + (cw - side) / 2;
        const y = margin + r * ch + (ch - side) / 2;
        return `<use href="#qr-code" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)}) rotate(${turns[r][c]} ${n / 2} ${n / 2})"/>`;
      }),
    )
    .join("");

  return frame(
    "qr",
    palette,
    `<rect ${box} fill="${palettes[palette][1]}"/>${tiles}`,
    `<path id="qr-code" class="solid" shape-rendering="crispEdges" d="${modules.join("")}"/>`,
    true,
  );
}

export const backs = {
  lewitt,
  khatam,
  guilloche,
  truchet,
  moire,
} satisfies Record<
  string,
  (seed: number, palette?: Palette, url?: string) => string
>;

/** Everything /test/backs shows, including designs not in the rotation yet. */
export const allBacks = { ...backs, qr };

/** Fill the box rather than fit inside it, for a back stretched over something
    that isn't 5:7. */
export const slice = (svg: string) =>
  svg.replace("<svg", `<svg preserveAspectRatio="xMidYMid slice"`);

const designs = Object.keys(backs) as (keyof typeof backs)[];

/** The table name picks the design and the palette; nothing else configures it. */
export const designFor = (table: string) =>
  designs[hash(table) % designs.length];

export function backFor(table: string) {
  return backs[designFor(table)](hash(table));
}

/** The drawn backs take the title face; the geometric ones take the body face. */
export const familyFor = (table: string) =>
  designFor(table) === "guilloche" || designFor(table) === "truchet"
    ? "title"
    : "body";

export const svg = backFor("");
