import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation } from '../convex/_generated/react'

const Home: NextPage = () => {
  const dealt = useQuery('getDealt')
  const deal = useMutation('deal')

  return (
    <div className={styles.container}>
      <Head><title>Poker</title></Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Poker</h1>

        <p className={styles.description}>
          {dealt?.community!.map((c: string) => <div key={c}>{c}</div>)}
        </p>
        <button className={styles.button} onClick={() => deal()}>
          Deal!
        </button>
      </main>
    </div>
  )
}

export default Home
