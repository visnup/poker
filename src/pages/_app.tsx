import "../styles/globals.css";
import type { AppProps } from "next/app";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import clientConfig from "../../convex/_generated/clientConfig";
const convex = new ConvexReactClient(clientConfig);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />
    </ConvexProvider>
  );
}
