import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { makeId } from '../../utils/makeId'
import Image from 'next/image'
import styles from './index.module.css'
import { LandingPage, Gold } from 'assets'
import { UnoLogo } from 'assets'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { connectToDatabase } from '../../utils/mongodb'
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Coin } from 'components/icons/Coin'

export default function Uno({ gold, bet }) {
  const [roomCode, setRoomCode] = useState('')
  const { connection } = useConnection()
  const { connected, wallet, publicKey, sendTransaction } = useWallet()
  const [gc, setGc] = useState(0)
  const router = useRouter()
  const [createdBet, setCreatedBet] = useState(0)
  const [finalBet, setFinalBet] = useState(0)
  const [joinedBet, setJoinedBet] = useState(0)
  const [solanaPrice, setSolanaPrice] = useState()

  useEffect(() => {
    try {
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      )
        .then(response => response.json())
        .then(data => {
          setSolanaPrice(data?.solana.usd)
        })
    } catch (e) {
      console.log(e)
    }
  }, [])

  useEffect(() => {
    try {
      const interval = setInterval(async () => {
        fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
        )
          .then(response => response.json())
          .then(data => setSolanaPrice(data?.solana.usd))
      }, 20000)
      return () => clearInterval(interval)
    } catch (e) {
      console.log(e)
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      const goldC = getGoldCount(publicKey.toBase58())
      setGc(goldC)
    }
  })

  const getGoldCount = publicKey => {
    const goldCount = gold.find(g => g.publicKey === publicKey)
    if (goldCount === undefined) {
      return 0
    }
    return goldCount.gold
  }

  const getBetCount = roomCode => {
    const betObj = bet.find(b => b.roomCode === roomCode)
    if (betObj === undefined) {
      return 0
    }
    return betObj.bet
  }

  const getPK = roomCode => {
    const betObj = bet.find(b => b.roomCode === roomCode)
    if (betObj === undefined) {
      return 0
    }
    return betObj.publicKey
  }

  const updateGold = async (currentGold, goldCount, pk, type) => {
    const putGold = async () => {
      let data
      if (type === 'd') {
        data = {
          publicKey: pk,
          gold: currentGold + goldCount,
        }
      } else {
        data = {
          publicKey: pk,
          gold: currentGold - goldCount,
        }
      }
      const response = await fetch('/api/gold/', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response.json()
    }
    try {
      putGold().then(() => {
        if (type === 'd')
          toast(`${goldCount} Gold is Deposited!`, {
            hideProgressBar: true,
            autoClose: 2500,
            type: 'success',
            position: 'top-center',
          })
        else
          toast(`${goldCount} Gold is Withdrawn!`, {
            hideProgressBar: true,
            autoClose: 2500,
            type: 'success',
            position: 'top-center',
          })
      })
    } catch (err) {
      toast(err, {
        hideProgressBar: true,
        autoClose: 2500,
        type: 'error',
        position: 'top-center',
      })
    }
  }

  const postGoldBetAndRoomCode = async (bet, rc) => {
    const postBet = async () => {
      const data = {
        publicKey: publicKey.toBase58(),
        roomCode: rc,
        bet: bet,
      }

      const response = await fetch('/api/bet/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.json()
    }
    try {
      postBet().then(() => {
        toast(`Bet is created!`, {
          hideProgressBar: true,
          autoClose: 2500,
          type: 'success',
          position: 'top-center',
        })
        router.push(`/unoPlay?roomCode=${rc}&pk=${publicKey}&bet=${finalBet}`)
      })
    } catch (err) {
      toast(err, {
        hideProgressBar: true,
        autoClose: 2500,
        type: 'error',
        position: 'top-center',
      })
    }
  }

  const handleChangeBet = event => {
    setCreatedBet(event.target.value)
  }

  const handleClickBet = e => {
    if (e.target.id === 'bet-button') {
      if (createdBet <= 0) {
        toast('Your bet must be greater than 0!', {
          hideProgressBar: true,
          autoClose: 2500,
          type: 'warning',
          position: 'top-center',
        })
      } else if (createdBet > gc) {
        toast('You have not enough gold!', {
          hideProgressBar: true,
          autoClose: 2500,
          type: 'warning',
          position: 'top-center',
        })
      } else {
        setFinalBet(createdBet)
      }
    }
  }

  const depositSol = useCallback(
    async amount => {
      try {
        if (!publicKey) throw new WalletNotConnectedError()

        const receiver = new PublicKey(
          '2FNfkLaK1gcizXZPQbcCQjbKsUszXPVh3ry5JQM1fecJ',
        )

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: receiver,
            lamports: LAMPORTS_PER_SOL * amount,
          }),
        )

        const signature = await sendTransaction(transaction, connection)

        await connection.confirmTransaction(signature, 'processed')

        toast('Sol is sent!', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
          position: 'top-center',
        })

        await updateGold(
          getGoldCount(publicKey.toBase58()),
          amount * solanaPrice,
          publicKey.toBase58(),
          'd',
        )
      } catch (err) {
        toast(err, {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'top-center',
        })
      }
    },
    [publicKey, sendTransaction, connection],
  )

  return (
    <div className={styles.homepage}>
      <ToastContainer />
      <div className={styles.homepageMenu}>
        <Image src={UnoLogo} width={200} height={200} />
        <div>
          {connected && (
            <div>
              <form>
                <div className={styles.bet}>
                  <div> Enter Bet Amount : </div>
                  <div className={styles.betAmount}>
                    <input
                      type="number"
                      id="betAmount"
                      name="betAmount"
                      onChange={handleChangeBet}
                      step="any"
                      className={styles.betAmountInput}
                    />
                  </div>
                  <button
                    id="bet-button"
                    style={{ marginLeft: '20px' }}
                    type="button"
                    onClick={handleClickBet}
                    disabled={!publicKey}
                  >
                    Bet
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className={styles.homepageForm}>
          {gc > 0 ? (
            <>
              <div className={styles.homepageJoin}>
                <div
                  style={{
                    margin: '15px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Game Code"
                    onChange={event => setRoomCode(event.target.value)}
                    className={styles.gameCode}
                  />
                </div>
                <div>
                  <button
                    className={`${styles.gameButton} ${styles.green}`}
                    onClick={() => {
                      const cBet = getBetCount(roomCode)
                      const cPK = getPK(roomCode)
                      {
                        cBet <= getGoldCount(publicKey.toBase58())
                          ? updateGold(
                              getGoldCount(publicKey.toBase58()),
                              cBet,
                              publicKey.toBase58(),
                              'w',
                            ).then(() => {
                              updateGold(
                                getGoldCount(cPK),
                                cBet,
                                cPK,
                                'w',
                              ).then(() => {
                                router.push(
                                  `/unoPlay?roomCode=${roomCode}&pk=${publicKey}&bet=${cBet}`,
                                )
                              })
                            })
                          : toast(
                              `Your have not ${cBet} gold for the given bet!`,
                              {
                                hideProgressBar: true,
                                autoClose: 3500,
                                type: 'warning',
                                position: 'top-center',
                              },
                            )
                      }
                    }}
                  >
                    JOIN GAME
                  </button>
                </div>
              </div>
              <h1>OR</h1>
              <div>
                <button
                  className={`${styles.gameButton} ${styles.orange}`}
                  disabled={finalBet <= 0 ? true : false}
                  onClick={async () => {
                    const rc = makeId(5)
                    await postGoldBetAndRoomCode(finalBet, rc)
                  }}
                >
                  CREATE MULTIPLAYER GAME
                </button>
                <button
                  className={`${styles.gameButton} ${styles.orange}`}
                  disabled={true}
                  onClick={async () => {
                    const rc = makeId(5)
                    await postGoldBetAndRoomCode(finalBet, rc)
                  }}
                >
                  SINGLEPLAYER
                </button>
              </div>
            </>
          ) : (
            <>
              {connected ? (
                <div className={styles.deposit}>
                  <div className={styles.titleColored}>
                    You have no Gold to Play!
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <div className={styles.depositTitle}>DEPOSIT</div>
                    <button
                      onClick={() => depositSol(0.2)}
                      disabled={!publicKey}
                    >
                      <span>0.2 SOL</span>
                    </button>
                    <button
                      onClick={() => depositSol(0.5)}
                      disabled={!publicKey}
                    >
                      <span>0.5 SOL</span>
                    </button>
                    <button onClick={() => depositSol(1)} disabled={!publicKey}>
                      <span>1 SOL</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.titleColored}>Connect your Wallet</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const { db } = await connectToDatabase()

  const gold = await db.collection('gold').find().toArray()

  const jBet = await db.collection('bet').find().toArray()

  return {
    props: {
      gold: JSON.parse(JSON.stringify(gold)),
      bet: JSON.parse(JSON.stringify(jBet)),
    },
  }
}
