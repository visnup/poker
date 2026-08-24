import Head from "next/head";
import { useRouter } from "next/router";
import { Preview } from "../components/Preview";
import { Board } from "../components/Table";
import { Welcome } from "../components/Welcome";
import { randomWord } from "../lib/words";

const board = ["A♠", "K♠", "A♥", "Q♠", "J♠"];

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <Preview table="" />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Board cards={board} revealed={1} />
      <Welcome onDismiss={() => router.push(`/${randomWord()}`)} />
      <style jsx>{`
        main {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          min-height: -webkit-fill-available;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
