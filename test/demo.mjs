import { chromium } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { api } from "../convex/_generated/api.js";
import { deck } from "../convex/deck.ts";

const OUT = process.env.OUT ?? "./tmp";
mkdirSync(OUT, { recursive: true });

const started = performance.now();
let previous = started;
const log = (what) => {
  const now = performance.now();
  const at = ((now - started) / 1000).toFixed(2);
  console.log(
    `${at.padStart(6)}s +${String(Math.round(now - previous)).padStart(5)}ms  ${what}`,
  );
  previous = now;
};
const ORIGIN = process.env.ORIGIN ?? "http://localhost:3000";
const room = process.env.ROOM ?? "bison";
// https://freestocktextures.com/texture/dark-wooden-floor,1658.html CC0 license
const SURFACE =
  process.env.SURFACE ?? fileURLToPath(new URL("wood.webp", import.meta.url));
const WEB = fileURLToPath(new URL("../public/demo.webm", import.meta.url));

// Queens lead the flop, the flush takes it on the turn, the board pairs on the
// river and fills the queens up. The hand that mucked would have made trips.
const BOARD = ["Q♥", "9♥", "4♠", "7♥", "7♣"];
const HOLES = ["A♥", "K♥", "Q♠", "Q♣", "7♠", "2♦"];
const dealt = [...BOARD, ...HOLES];
const stacked = [...dealt, ...deck.filter((card) => !dealt.includes(card))];

const STAGE = { width: 1600, height: 900 };
// An ellipse because the table is landscape. `reach` pulls one seat in: the
// seats beside the tablet clear it, the one past its end stays in frame.
const O = { x: STAGE.width / 2, y: 400 };
const RING = { x: 830, y: 520 };
const at = (angle, reach = 1) => ({
  x: O.x + Math.cos((angle * Math.PI) / 180) * RING.x * reach,
  y: O.y + Math.sin((angle * Math.PI) / 180) * RING.y * reach,
});

// Stage pixels per millimeter. Points are the wrong ruler — a Galaxy fits
// fewer into a millimeter than an iPhone — so devices are sized by real width.
const PX_PER_MM = 3.13;
const BEZELS = JSON.parse(
  readFileSync(new URL("bezels.json", import.meta.url), "utf8"),
);
const device = (key, layout) => {
  const { file, w, h, screen, radius } = BEZELS.devices[key];
  const [x, y, aw, ah] = screen;
  return {
    file,
    layout,
    // The app is `layout` wide whatever the screen is; this fills the aperture.
    fill: aw / layout,
    appHeight: (layout * ah) / aw,
    aperture: { x, y },
    radius: radius / (aw / layout),
    w,
    h,
    scale: PX_PER_MM / BEZELS.pxPerMm,
  };
};

// Face the board, then most of the way back: square-on reads sideways.
const READ = 0.75;
const norm = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
const facing = (angle) => {
  const board = norm(angle - 90);
  const upright = Math.abs(board) > 90 ? Math.sign(board) * 180 : 0;
  return board + (upright - board) * READ;
};

// Fixed, not random, so two takes can be compared.
const JITTER = [
  { x: -12, y: 8, turn: 6 },
  { x: 14, y: 10, turn: -5 },
  { x: -10, y: -14, turn: 4 },
];

// Near seats first: the two who peek together are the two sitting side by side.
const TABLE = { ...device("ipad", 1140), ...O, facing: 0 };
const HANDS = ["air", "pro", "galaxy"];
const SEATS = [
  { angle: 135, reach: 1 },
  { angle: 45, reach: 1 },
  { angle: -20, reach: 0.94 },
].map(({ angle, reach }, i) => ({
  ...device(HANDS[i], 380),
  x: at(angle, reach).x + JITTER[i].x,
  y: at(angle, reach).y + JITTER[i].y,
  angle,
  facing: facing(angle) + JITTER[i].turn,
}));

// about:blank can't reach a file:// url.
const inline = (file) => {
  const type = { png: "png", webp: "webp", avif: "avif" }[
    file.split(".").pop().toLowerCase()
  ];
  const data = readFileSync(file).toString("base64");
  return `data:image/${type ?? "jpeg"};base64,${data}`;
};
const surface = (file) => `url(${inline(file)})`;
// Gentle: the devices cover the middle, so only the ring around them shows.
const ground = `background-image:
     radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,.05) 0%, rgba(0,0,0,.2) 60%, rgba(0,0,0,.5) 100%),
     ${surface(SURFACE)};
   background-size: cover; background-position: center;`;

const wrapper = `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; height: 100%; background: #08090a; }
  #stage {
    position: relative; width: ${STAGE.width}px; height: ${STAGE.height}px; overflow: hidden;
    ${ground}
  }
  .device {
    position: absolute;
    transition: opacity .45s ease, transform .58s cubic-bezier(.2,.72,.28,1);
  }
  .device iframe {
    position: absolute; border: 0; background: #fff; transform-origin: 0 0;
  }
  .device img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none;
  }
  /* The same png under the app, only for its shadow. drop-shadow casts from
     the whole alpha, so filtering the top copy blurred the Dynamic Island onto
     the screen. */
  .device img.cast {
    filter: drop-shadow(0 26px 44px rgba(0,0,0,.6)) drop-shadow(0 3px 10px rgba(0,0,0,.45));
  }
  .touch {
    position: absolute; width: 78px; height: 78px; margin: -39px 0 0 -39px;
    border-radius: 50%; z-index: 9; pointer-events: none; opacity: 0;
    transition: opacity .18s ease;
    background: radial-gradient(circle, rgba(255,255,255,.5), rgba(255,255,255,.14) 62%, transparent 72%);
    box-shadow: inset 0 0 0 2px rgba(255,255,255,.35);
  }
</style>
<div id="stage"></div>`;

// `arriving` holds it back down its own axis, so it slides in from the player.
const place = ({ w, h, x, y, facing, scale }, arriving) => {
  const out = arriving ? 500 : 0;
  const f = (facing * Math.PI) / 180;
  log(
    `place ${arriving ? "arriving" : "settled"} at ${Math.round(x)},${Math.round(y)}`,
  );
  return (
    `left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;` +
    `opacity:${arriving ? 0 : 1};` +
    `transform:translate(${-Math.sin(f) * out}px,${Math.cos(f) * out}px) ` +
    `rotate(${facing}deg) scale(${scale * (arriving ? 1.14 : 1)});`
  );
};

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: STAGE,
    deviceScaleFactor: 2,
    colorScheme: process.env.SCHEME ?? "light",
    hasTouch: true,
  });

  await context.addInitScript(() => {
    const hide = () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important }";
      document.documentElement.append(style);
    };
    if (document.documentElement) hide();
    else addEventListener("DOMContentLoaded", hide);

    // Same-origin iframes share the tab's sessionStorage, so every frame would
    // read the first one's player id back and revive its row.
    const store = new Map();
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
      },
    });
  });

  const page = await context.newPage();
  await page.setContent(wrapper);
  const wait = (ms) => page.waitForTimeout(ms);

  const down = new Map();
  const paint = () =>
    page.evaluate(
      (live) => {
        const stage = document.getElementById("stage");
        for (const { id, x, y } of live) {
          let dot = stage.querySelector(`.touch[data-id="${id}"]`);
          if (!dot) {
            dot = document.createElement("div");
            dot.className = "touch";
            dot.dataset.id = id;
            stage.append(dot);
          }
          Object.assign(dot.style, {
            left: `${x}px`,
            top: `${y}px`,
            opacity: 1,
          });
        }
        const ids = live.map(({ id }) => String(id));
        for (const dot of stage.querySelectorAll(".touch"))
          if (!ids.includes(dot.dataset.id)) dot.style.opacity = 0;
      },
      [...down].map(([id, point]) => ({ id, ...point })),
    );

  async function drag(from, to, { steps = 26, pause = 12, hold = 0 } = {}) {
    log(`drag ${steps} steps, ${pause}ms apart, ${hold}ms hold`);
    down.set(0, from);
    await paint();
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) {
      const x = from.x + ((to.x - from.x) * i) / steps;
      const y = from.y + ((to.y - from.y) * i) / steps;
      await page.mouse.move(x, y);
      down.set(0, { x, y });
      await paint();
      await wait(pause);
    }
    await wait(hold);
    await page.mouse.up();
    down.delete(0);
    await paint();
  }

  async function tap({ x, y, width, height }) {
    log("tap");
    const [cx, cy] = [x + width / 2, y + height / 2];
    down.set(0, { x: cx, y: cy });
    await paint();
    await wait(140);
    await page.mouse.click(cx, cy);
    await wait(200);
    down.delete(0);
    await paint();
  }

  // Down the phone's own axis, in app pixels from the top of the screen.
  const along = ({ x, y, appHeight, fill, facing, scale }, top) => {
    const f = (facing * Math.PI) / 180;
    const d = (top - appHeight / 2) * fill * scale;
    return { x: x - Math.sin(f) * d, y: y + Math.cos(f) * d };
  };
  const gesture = (seat, from, to, options) =>
    drag(along(seat, from), along(seat, to), options);

  // 250px is where a pull stops being a peek: let go short of it and the cards
  // flip back, go past it and they stay face up.
  const PEEK = [120, 270];
  const peek = (seat) => gesture(seat, ...PEEK, { pause: 18, hold: 700 });
  const reveal = (seat) => gesture(seat, 120, 540, { steps: 16, pause: 5 });
  const fold = (seat) => gesture(seat, 300, -100, { steps: 14, pause: 8 });

  // Chrome's touch input is one device: touchEnd lifts every finger at once,
  // so hands start staggered but all let go together.
  const cdp = await context.newCDPSession(page);
  const dispatch = (type) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd"
          ? []
          : [...down]
              .filter(([id]) => id > 0)
              .map(([id, { x, y }]) => ({ id, x, y })),
    });

  async function peekTogether(seats, { stagger = 9, steps = 20, tick = 24 }) {
    log(`peekTogether ${seats.length} hands, ${stagger} ticks apart`);
    const pulls = seats.map((seat, i) => ({
      id: i + 1,
      from: along(seat, PEEK[0]),
      to: along(seat, PEEK[1]),
      begin: i * stagger,
    }));
    const last = Math.max(...pulls.map((p) => p.begin)) + steps + 24;
    for (let t = 0; t <= last; t++) {
      const arriving = pulls.some((p) => p.begin === t);
      for (const { id, from, to, begin } of pulls) {
        if (t < begin) continue;
        const k = Math.min((t - begin) / steps, 1);
        down.set(id, {
          x: from.x + (to.x - from.x) * k,
          y: from.y + (to.y - from.y) * k,
        });
      }
      await dispatch(arriving ? "touchStart" : "touchMove");
      await paint();
      await wait(tick);
    }
    await dispatch("touchEnd");
    for (const id of [...down.keys()]) if (id > 0) down.delete(id);
    await paint();
  }

  async function add(id, src, box) {
    log(`add ${id}`);
    await page.evaluate(
      ({ id, src, arriving, settled, screen, bezel }) => {
        const device = document.createElement("div");
        device.className = "device";
        device.setAttribute("style", arriving);
        const el = document.createElement("iframe");
        Object.assign(el, { id, src });
        el.setAttribute("style", screen);
        const [cast, png] = [0, 1].map(() => {
          const img = document.createElement("img");
          img.src = bezel;
          return img;
        });
        cast.className = "cast";
        device.append(cast, el, png);
        document.getElementById("stage").prepend(device);
        // A frame later, so the transition has a start to run from.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => device.setAttribute("style", settled)),
        );
      },
      {
        id,
        src,
        arriving: place(box, true),
        settled: place(box, false),
        // Behind the case, so the png masks the corners.
        screen:
          `left:${box.aperture.x - 1}px;top:${box.aperture.y - 1}px;` +
          `width:${box.layout}px;height:${Math.ceil(box.appHeight)}px;` +
          `border-radius:${box.radius}px;` +
          `transform:scale(${box.fill});`,
        bezel: inline(fileURLToPath(new URL(box.file, import.meta.url))),
      },
    );
    const frame = page.frameLocator(`#${id}`);
    await frame.locator(".card").first().waitFor({ timeout: 20_000 });
    return frame;
  }

  // Stack the deck before anyone is looking.
  process.loadEnvFile(".env.local");
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  await convex.mutation(api.deals.deal, { table: room, stacked });

  // First: `join` gives the lowest free seat, and seat 0 renders the table.
  const table = await add("table", `${ORIGIN}/${room}?table`, TABLE);
  const board = () => table.locator(".board").boundingBox();

  await page.screencast.start({ path: `${OUT}/demo.webm`, size: STAGE });
  await wait(1800);
  for (const [i, seat] of SEATS.entries()) {
    await add(`p${i}`, `${ORIGIN}/${room}`, seat);
    if (i < SEATS.length - 1) await wait(800);
  }
  await wait(500);

  // Everyone looks, nobody shows: each pull stops short and springs back. The
  // third goes on the mouse pointer, which releases on its own.
  await peekTogether(SEATS.slice(0, 2), { stagger: 9 });
  await wait(900);
  await peek(SEATS[2]);
  await wait(1200);

  await tap(await board()); // flop
  await wait(1800);

  // One mucks, and the two still in turn theirs face up.
  await fold(SEATS[2]);
  await wait(900);
  for (const i of [0, 1]) {
    await reveal(SEATS[i]);
    await wait(900);
  }

  await tap(await board()); // turn
  await wait(1600);
  await tap(await board()); // river
  await wait(2200);

  // Next hand: the deal passes clockwise, so straight across, not diagonally.
  const onTable = (lx, ly) => ({
    x:
      TABLE.x +
      (TABLE.aperture.x + lx * TABLE.fill - TABLE.w / 2) * TABLE.scale,
    y:
      TABLE.y +
      (TABLE.aperture.y + ly * TABLE.fill - TABLE.h / 2) * TABLE.scale,
  });
  await drag(onTable(130, 130), onTable(TABLE.layout - 130, 130), {
    steps: 22,
    pause: 16,
  });
  await wait(2600);

  await page.screencast.stop();
  await page.screenshot({ path: `${OUT}/demo-still.png` });
} finally {
  await browser.close();
}

log("encoding");
execFileSync("ffmpeg", [
  ...["-y", "-v", "error", "-i", `${OUT}/demo.webm`],
  ...["-vf", "scale=1280:-2", "-c:v", "libvpx-vp9", "-crf", "36"],
  ...["-b:v", "0", "-row-mt", "1", "-an", WEB],
]);
log(`${OUT}/demo.webm → public/demo.webm  room=${room}`);
