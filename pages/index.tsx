import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation } from '../convex/_generated/react'
import { useEffect, useState } from 'react'

function Community() {
  const deal = useMutation('deal')
  const dealt = useQuery('getDealt')
  return (
    <div>
      <p className={styles.description}>
        {dealt?.community!.map((c: string) => <div key={c}>{c}</div>)}
      </p>
      <button className={styles.button} onClick={() => deal()}>
        Deal!
      </button>
    </div>
  )
}

function Hole({player}) {
  const dealt = useQuery('getDealt')
  const cards = dealt?.cards.slice(player.n, player.n + 2)
  return (
    <div>
      {JSON.stringify(cards)}
    </div>
  )
}

const Home: NextPage = () => {
  const join = useMutation('join')
  const ping = useMutation('ping')
  const [player, setPlayer] = useState();

  useEffect(() => {
    if (!player) join().then(setPlayer)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) ping(player._id)
    }, 5e3)
    return () => clearInterval(interval)
  }, [player])

  return (
    <div className={styles.container}>
      <Head><title>Poker</title></Head>

      <main className={styles.main}>
        {JSON.stringify(player)}
        {player ? player.n === 0 ? <Community /> : <Hole player={player} /> : null}
      </main>
    </div>
  )
}

export default Home
