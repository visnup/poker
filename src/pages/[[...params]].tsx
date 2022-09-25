import { useRouter } from "next/router";
import { Game } from "../components/Game";

export default function Index() {
  const router = useRouter();
  if (!router.isReady) return null;
  const { params } = router.query;
  const [table, seat] = params && params[0] === "0" ? ["", "0"] : params ?? [];
  return <Game table={table} seat={seat === "0" ? 0 : undefined} />;
}
