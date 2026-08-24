import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { Game } from "../components/Game";
import { Welcome } from "../components/Welcome";
import { randomWord } from "../lib/words";

// Only so the crawler's HTML names the table; the client still reads the router.
export function getServerSideProps({ params, res }: GetServerSidePropsContext) {
  // the markup is a pure function of the table name, and a deploy gets a fresh cache
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  );
  const path = params?.params as string[] | undefined;
  return { props: { table: !path || path[0] === "0" ? "" : path[0] } };
}

export default function Index({ table: shared }: { table: string }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`https://poker.dance/api/og?table=${encodeURIComponent(shared)}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {router.isReady && <Board router={router} />}
    </>
  );
}

function Board({ router }: { router: ReturnType<typeof useRouter> }) {
  const { params } = router.query;
  const [table, seat] =
    params && params[0] === "0" ? ["", "0"] : (params ?? []);
  return (
    <>
      <Game table={table} seat={seat === "0" ? 0 : undefined} />
      {!params && (
        <Welcome onDismiss={() => router.push(`/${randomWord()}/0`)} />
      )}
    </>
  );
}
