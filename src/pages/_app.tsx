import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useReducedMotion } from "@react-spring/web";
import Head from "next/head";
import { TAGLINE } from "../components/Welcome";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function App({ Component, pageProps }: AppProps) {
  useReducedMotion(); // sets the global skipAnimation, which also bypasses delays
  return (
    <ConvexProvider client={convex}>
      <Head>
        <title>Poker</title>
        <meta name="description" content={TAGLINE} />
      </Head>
      <Component {...pageProps} />
    </ConvexProvider>
  );
}
