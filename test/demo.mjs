import { chromium, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = process.env.OUT ?? ".";
const ORIGIN = process.env.ORIGIN ?? "http://localhost:3000";
// The card back, its palette and the face design are all seeded from the table
// name, so a fixed one keeps the look reproducible between takes.
const room = process.env.ROOM ?? "bison";
// The table everything sits on, bundled beside the script so a bare run needs
// no arguments. 3200x2000 is pixel parity with the still at deviceScaleFactor 2.
// "Dark wooden floor", freestocktextures.com/texture/dark-wooden-floor,1658.html
// — CC0, no attribution required. Cropped to 16:10 from the 5824x3264 original.
const SURFACE =
  process.env.SURFACE ?? fileURLToPath(new URL("wood.webp", import.meta.url));

const STAGE = { width: 1600, height: 1000 };
// A seat is an angle and a radius from the board. The ring is an ellipse, not
// a circle — the table is landscape, so a seat at the end of it is much closer
// than one along the side — and the board rides above the middle of the frame
// to leave a whole phone's worth of room under the near seat.
const O = { x: STAGE.width / 2, y: 400 };
const RING = { x: 830, y: 520 };
// `reach` pulls one seat in or out on its own: the seats beside the tablet have
// to clear it, and the seat past its end has to stay inside the frame, and one
// ellipse can't do both.
const at = (angle, reach = 1) => ({
  x: O.x + Math.cos((angle * Math.PI) / 180) * RING.x * reach,
  y: O.y + Math.sin((angle * Math.PI) / 180) * RING.y * reach,
});

// Every device lays the app out at the width its own <meta name="viewport">
// asks for — 1140 for a table, 380 for a hand — and then scales that to the
// size the device really is. One shared SCALE keeps them all to the same ruler,
// so an iPad and a Pixel are as different on screen as they are on a table.
// A seat at the end of the table has to fit the tablet's half height plus a
// whole phone inside the frame below it, which is what caps this.
const SCALE = 0.6;
// `bezel` and `radius` are the case around the screen. Bezel is a fraction of
// the device's own width — 4.9% is 3.5mm on a phone, 3.4% is 6mm on an iPad —
// so the case grows with the device instead of staying a fixed rim as the whole
// composition zooms.
const screen = (name, layout, { bezel, radius }) => {
  const { width, height } = devices[name].viewport;
  return {
    w: layout,
    h: Math.round((layout * height) / width),
    scale: (SCALE * width) / layout,
    radius,
    pad: Math.round(bezel * layout),
  };
};

// Where a seat sits is polar; which way its phone is turned is not. Facing the
// board squarely leaves everyone but the near seats sideways and unreadable, so
// each phone turns back toward upright — all the way for the near seats, to
// upside down for the far ones, which is what a real table looks like anyway.
const READ = 0.75;
const norm = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
const facing = (angle) => {
  const board = norm(angle - 90);
  const upright = Math.abs(board) > 90 ? Math.sign(board) * 180 : 0;
  return board + (upright - board) * READ;
};

// Nobody sets a phone down on a perfect ring. Fixed rather than random so two
// takes can be compared.
const JITTER = [
  { x: -12, y: 8, turn: 6 },
  { x: 14, y: 10, turn: -5 },
  { x: -10, y: -14, turn: 4 },
];

// Three at a four-sided table leaves a corner open, which is what three people
// actually looks like. Near seats first, so the two who peek together are the
// two sitting next to each other.
const TABLE = {
  ...screen("iPad Pro 11 landscape", 1140, { bezel: 0.034, radius: 20 }),
  ...O,
  facing: 0,
};
const HANDS = ["iPhone 17", "iPhone 16 Pro Max", "Pixel 10"];
const SEATS = [
  { angle: 135, reach: 1 },
  { angle: 45, reach: 1 },
  { angle: -20, reach: 0.94 },
].map(({ angle, reach }, i) => ({
  ...screen(HANDS[i], 380, { bezel: 0.049, radius: 44 }),
  x: at(angle, reach).x + JITTER[i].x,
  y: at(angle, reach).y + JITTER[i].y,
  angle,
  facing: facing(angle) + JITTER[i].turn,
}));

// Inlined because the page is about:blank, which can't reach a file:// url.
const surface = (file) => {
  const type = { png: "png", webp: "webp", avif: "avif" }[
    file.split(".").pop().toLowerCase()
  ];
  const data = readFileSync(file).toString("base64");
  return `url(data:image/${type ?? "jpeg"};base64,${data})`;
};
// Gentle, because the devices cover the middle: the only part of the photo
// anyone sees is the ring around them, and a heavy vignette crushes exactly
// that. Enough falloff to hold the eye on the table, not enough to lose grain.
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
    background: linear-gradient(155deg, #303237 0%, #131418 45%, #1d1f23 100%);
    box-shadow: 0 32px 66px rgba(0,0,0,.72), 0 4px 14px rgba(0,0,0,.5),
                inset 0 0 0 1px rgba(255,255,255,.13);
  }
  .device iframe {
    display: block; border: 0; background: #fff;
    box-shadow: 0 0 0 1px rgba(0,0,0,.55);
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

// The shell is padded by the bezel, so it is offset by that much to keep the
// screen — not the case — centred on the seat.
const place = ({ w, h, x, y, scale, facing, pad, radius }) =>
  `left:${x - w / 2 - pad}px;top:${y - h / 2 - pad}px;padding:${pad}px;` +
  `border-radius:${radius + pad}px;transform:rotate(${facing}deg) scale(${scale});`;

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: STAGE,
    deviceScaleFactor: 2,
    colorScheme: process.env.SCHEME ?? "light",
    hasTouch: true,
  });

  await context.addInitScript(() => {
    if (!new URLSearchParams(location.search).has("demo")) return;

    const hide = () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important }";
      document.documentElement.append(style);
    };
    if (document.documentElement) hide();
    else addEventListener("DOMContentLoaded", hide);

    // Same-origin iframes share the tab's sessionStorage, so every frame would
    // read the first one's player id back and revive its row. `?demo=` gives
    // each its own.
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

  // One dot per finger down, so a four-handed beat reads as four people.
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
    const [cx, cy] = [x + width / 2, y + height / 2];
    down.set(0, { x: cx, y: cy });
    await paint();
    await wait(140);
    await page.mouse.click(cx, cy);
    await wait(200);
    down.delete(0);
    await paint();
  }

  // A hand's whole screen is the drag surface. Gestures run down the phone's
  // own axis in its own pixels, measured from the top edge, because every hand
  // lays out at 380px wide however big the phone is — the cards are in the same
  // place on all of them, only the screen below is taller or shorter.
  const along = ({ x, y, h, scale, facing }, top) => {
    const f = (facing * Math.PI) / 180;
    const d = (top - h / 2) * scale;
    return { x: x - Math.sin(f) * d, y: y + Math.cos(f) * d };
  };
  const gesture = (seat, from, to, options) =>
    drag(along(seat, from), along(seat, to), options);

  // 250px is where a pull stops being a peek: let go short of it and the cards
  // flip back, go past it and they stay face up.
  const peek = (seat) => gesture(seat, 120, 330, { pause: 18, hold: 700 });
  const reveal = (seat) => gesture(seat, 120, 540, { pause: 14 });
  const fold = (seat) => gesture(seat, 300, -100, { steps: 14, pause: 8 });

  // Everyone looks at their cards at once, a beat apart. Chrome's touch input
  // is a single device — a touchEnd carries no points and lifts every finger,
  // and dropping a point from a touchMove releases nothing — so the hands can
  // start staggered but they all let go together.
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
    const pulls = seats.map((seat, i) => ({
      id: i + 1,
      from: along(seat, 120),
      to: along(seat, 330),
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
    await page.evaluate(
      ({ id, src, shell, screen }) => {
        const device = document.createElement("div");
        device.className = "device";
        device.setAttribute("style", shell);
        const el = document.createElement("iframe");
        Object.assign(el, { id, src });
        el.setAttribute("style", screen);
        device.append(el);
        document.getElementById("stage").prepend(device);
      },
      {
        id,
        src,
        shell: place(box),
        screen: `width:${box.w}px;height:${box.h}px;border-radius:${box.radius}px;`,
      },
    );
    const frame = page.frameLocator(`#${id}`);
    await frame.locator(".card").first().waitFor({ timeout: 20_000 });
    return frame;
  }

  // The table has to join first: `join` hands out the lowest free seat, and a
  // phone holding seat 0 would render a second table view.
  const table = await add("table", `${ORIGIN}/${room}?demo=t&table`, TABLE);
  const board = () => table.locator(".board").boundingBox();

  // Open on a table nobody has joined yet, because that is the part worth
  // showing: the seats fill by opening a link, with nothing to install.
  await page.screencast.start({ path: `${OUT}/demo.webm`, size: STAGE });
  await wait(1800);
  for (const [i, seat] of SEATS.entries()) {
    await add(`p${i}`, `${ORIGIN}/${room}?demo=${i}`, seat);
    await wait(800);
  }
  await page.screenshot({ path: `${OUT}/demo-still.png` });
  await wait(900);

  // Deal: the button rests in the felt's top left corner, and the deal passes
  // clockwise, so it goes straight across to the next seat rather than
  // diagonally over the whole table.
  const onTable = (lx, ly) => ({
    x: TABLE.x + (lx - TABLE.w / 2) * TABLE.scale,
    y: TABLE.y + (ly - TABLE.h / 2) * TABLE.scale,
  });
  await drag(onTable(130, 130), onTable(TABLE.w - 130, 130), {
    steps: 22,
    pause: 16,
  });
  await wait(2000);

  // Pre-flop everyone looks and nobody shows: each pull stops short and springs
  // back. Two go at once a beat apart and let go together, because one touch
  // device can only lift every finger at the same time; the third looks after
  // them, on the mouse pointer, which releases on its own.
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
  await wait(3000);

  await page.screencast.stop();
  console.log(`${OUT}/demo.webm  room=${room}`);
} finally {
  await browser.close();
}
