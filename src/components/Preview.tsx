import Head from "next/head";

export function Preview({ table }: { table: string }) {
  return (
    <Head>
      <meta
        property="og:image"
        content={`https://poker.dance/api/og?table=${encodeURIComponent(table)}`}
      />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
