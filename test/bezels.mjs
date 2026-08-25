// Crops vendor bezels to the device, renders them all at one pixels-per-mm,
// and writes out where each screen sits. Sources are in gitignored tmp/, from
// the vendors under the vendors' terms:
//   apple  https://developer.apple.com/design/resources/#product-bezels
//   galaxy https://www.meta.com/design-at-meta/tools/devices/
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PX_PER_MM = 8;

// `mm` is the manufacturer's width; the source path names model and color.
const SOURCES = [
  {
    name: "ipad",
    mm: 247.6,
    from: 'tmp/PNG/iPad Air 11" (M4) - Starlight - Landscape.png',
  },
  {
    name: "air",
    mm: 74.7,
    from: "tmp/PNG/iPhone Air/iPhone Air - Space Black - Portrait.png",
  },
  {
    name: "pro",
    mm: 71.9,
    from: "tmp/PNG/iPhone 17 Pro/iPhone 17 Pro - Deep Blue - Portrait.png",
  },
  {
    name: "galaxy",
    mm: 71.2,
    from: "tmp/High Resolution/Samsung Galaxy S21 5G — Pink@2x.png",
  },
];

const alpha = (file) => {
  const [w, h] = execFileSync("ffprobe", [
    ...["-v", "error", "-select_streams", "v"],
    ...["-show_entries", "stream=width,height", "-of", "csv=p=0", file],
  ])
    .toString()
    .trim()
    .split(",")
    .map(Number);
  const raw = execFileSync(
    "ffmpeg",
    [
      ...["-v", "error", "-i", file, "-vf", "alphaextract,format=gray"],
      ...["-f", "rawvideo", "-pix_fmt", "gray", "-"],
    ],
    { maxBuffer: 1 << 30 },
  );
  return { w, h, at: (x, y) => raw[y * w + x] };
};

// The Galaxy pads ~150px of empty canvas the Apple frames don't.
const body = ({ w, h, at }) => {
  let [l, r, t, b] = [w, -1, h, -1];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (at(x, y) > 128) {
        if (x < l) l = x;
        if (x > r) r = x;
        if (y < t) t = y;
        if (y > b) b = y;
      }
  return [l, t, r - l + 1, b - t + 1];
};

// Walk the transparent hole out from the middle. The vertical run comes off an
// inset column: dead center hits the Dynamic Island and stops short.
const aperture = ({ w, h, at }) => {
  const [cx, cy] = [w >> 1, h >> 1];
  let [l, r] = [cx, cx];
  while (l > 0 && at(l - 1, cy) === 0) l--;
  while (r < w - 1 && at(r + 1, cy) === 0) r++;
  const x = Math.round(l + (r - l) * 0.15);
  let [t, b] = [cy, cy];
  while (t > 0 && at(x, t - 1) === 0) t--;
  while (b < h - 1 && at(x, b + 1) === 0) b++;
  // Via the body's radius, since the rects are concentric. Measured at the
  // screen it reads 0 — a thin bezel's corner pixel is outside the device.
  let corner = 0;
  while (corner < w && at(corner, 0) === 0) corner++;
  return {
    screen: [l, t, r - l + 1, b - t + 1],
    radius: Math.max(0, corner - l),
  };
};

const manifest = SOURCES.map(({ name, mm, from }) => {
  const file = `devices/${name}.webp`;
  const out = fileURLToPath(new URL(file, import.meta.url));
  const step = fileURLToPath(new URL(`../tmp/${name}.png`, import.meta.url));
  const [x, y, w, h] = body(alpha(from));
  execFileSync("ffmpeg", [
    ...["-y", "-v", "error", "-i", from],
    ...[
      "-vf",
      `crop=${w}:${h}:${x}:${y},scale=${Math.round(mm * PX_PER_MM)}:-1:flags=lanczos`,
    ],
    step,
  ]);
  // -alpha_q 100 keeps the aperture edge exact.
  execFileSync("cwebp", [
    ...["-quiet", "-q", "92", "-m", "6", "-alpha_q", "100"],
    ...[step, "-o", out],
  ]);
  const cropped = alpha(out);
  const { screen, radius } = aperture(cropped);
  console.log(
    file.padEnd(22),
    `${cropped.w}x${cropped.h}`.padEnd(11),
    `screen ${screen.join(",")} r${radius}`,
  );
  return [name, { file, mm, w: cropped.w, h: cropped.h, screen, radius }];
});

writeFileSync(
  fileURLToPath(new URL("bezels.json", import.meta.url)),
  JSON.stringify(
    { pxPerMm: PX_PER_MM, devices: Object.fromEntries(manifest) },
    null,
    2,
  ) + "\n",
);
