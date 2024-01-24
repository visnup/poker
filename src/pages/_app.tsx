import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Head from "next/head";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <Head>
        <title>Poker</title>
      </Head>
      <Component {...pageProps} />
    </ConvexProvider>
  );
}
