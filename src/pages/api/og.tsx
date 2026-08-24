import { ImageResponse } from "next/og";
import { backFor, familyFor, hash, paletteFor, palettes } from "@/lib/card";
import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const font = (file: string) =>
  readFileSync(join(process.cwd(), "src/fonts", file));

const fonts = [
  {
    name: "Fraunces",
    data: font("Fraunces-SemiBold.woff"),
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Dosis",
    data: font("Dosis-Medium.woff"),
    weight: 500 as const,
    style: "normal" as const,
  },
];

const height = 560;
const width = (height * 5) / 7;
const top = 630 - (height * 5) / 6; // the bottom sixth runs off the frame

const card = (back: string, paper: string, rotate: number, left: number) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      width,
      height,
      borderRadius: 20,
      backgroundColor: paper,
      backgroundImage: `url("data:image/svg+xml;base64,${back}")`,
      backgroundSize: `${width}px ${height}px`,
      transform: `rotate(${rotate}deg)`,
      boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
    }}
  />
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const table = String(req.query.table ?? "");
  const seed = hash(table);
  const [, paper, darkInk, darkPaper] = palettes[paletteFor(seed)];
  const back = Buffer.from(backFor(table)).toString("base64");
  const headline = table || "Play a hand";
  const title = headline.length > 12 ? 68 : headline.length > 8 ? 92 : 116;
  const face = familyFor(table) === "title" ? "Fraunces" : "Dosis";

  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: darkPaper,
        color: darkInk,
      }}
    >
      {card(back, paper, -9, 50)}
      {card(back, paper, 5, 190)}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 660,
          maxWidth: 470,
        }}
      >
        <div
          style={{
            fontFamily: face,
            fontSize: title,
            lineHeight: 1.3,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: "Dosis",
            fontSize: 36,
            letterSpacing: 1,
            opacity: 0.7,
          }}
        >
          {`poker.dance/${table}`.replace(/\/$/, "")}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts },
  );

  res.setHeader("Content-Type", "image/png");
  // not immutable: a sixth back reshuffles `hash(table) % designs.length`
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  );
  res.end(Buffer.from(await image.arrayBuffer()));
}
