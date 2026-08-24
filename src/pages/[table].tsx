import type { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { Game } from "../components/Game";
import { Preview } from "../components/Preview";

// `query.table` is the path segment here, so the flag has to come off the raw url
export function getServerSideProps({ params, req }: GetServerSidePropsContext) {
  return {
    props: {
      table: String(params?.table ?? ""),
      asTable: new URL(req.url ?? "/", "http://n").searchParams.has("table"),
    },
  };
}

export default function TablePage({
  table,
  asTable,
}: {
  table: string;
  asTable: boolean;
}) {
  useEffect(() => {
    if (asTable) history.replaceState(null, "", location.pathname);
  }, [asTable]);

  return (
    <>
      <Preview table={table} />
      <Game table={table} seat={asTable ? 0 : undefined} />
    </>
  );
}
