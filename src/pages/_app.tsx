import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useReducedMotion } from "@react-spring/web";
import { Analytics } from "@vercel/analytics/next";
import Head from "next/head";
import { Dosis, Fraunces, Nothing_You_Could_Do } from "next/font/google";
import { description } from "../components/Welcome";

const body = Dosis({ subsets: ["latin"], variable: "--font-body" });
const title = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"], // 32px corner index up to the 144px court rank
  variable: "--font-title",
});
const script = Nothing_You_Could_Do({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
});

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function App({ Component, pageProps, router }: AppProps) {
  useReducedMotion(); // sets the global skipAnimation, which also bypasses delays
  return (
    <ConvexProvider client={convex}>
      <Head>
        <title>Poker Dance</title>
        <meta name="description" content={description} />
        {router.pathname.startsWith("/test/") && (
          <meta name="robots" content="noindex" />
        )}
      </Head>
      <div
        className={`${body.className} ${body.variable} ${title.variable} ${script.variable}`}
        style={{ display: "contents" }} // pages bring their own <main>
      >
        <Component {...pageProps} />
      </div>
      <Analytics />
    </ConvexProvider>
  );
}
