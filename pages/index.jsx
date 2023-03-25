import { DacksLogo, Gold } from 'assets'
import { Layout } from 'components'
import { Hero, Partition, Trending } from 'landingPage'
import { connectToDatabase } from '../utils/mongodb'
import Image from 'next/image'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import {
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import useUserSOLBalanceStore from 'stores/useUserSOLBalanceStore.tsx'
import React, { FC, useCallback, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import SlideShow from 'components/slider'

export default function Home({ gold }) {
  const { connected, wallet, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const bs58 = require('bs58')
  const [solD, setSolD] = useState(0)
  const [solW, setSolW] = useState(0)
  const [solanaPrice, setSolanaPrice] = useState()

  const handleChangeSolDeposit = event => {
    console.log(solD)
    setSolD(event.target.value)
  }

  const handleClickSolDeposit = () => {
    depositSol(solD).then(() => {
      refreshData()
    })
  }

  const handleChangeSolWithdraw = event => {
    console.log(solW)
    setSolW(event.target.value)
  }

  const refreshData = () => {
    router.replace(router.asPath)
  }

  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const balance = useUserSOLBalanceStore(s => s.balance)

  const depositSol = useCallback(
    async amount => {
      try {
        if (!publicKey) throw new WalletNotConnectedError()
        if (amount < balance) {
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

          toast(`${amount} Sol is DEPOSITED!`, {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            position: 'top-left',
          })

          getUserSOLBalance(publicKey, connection)
          await updateGold(
            getGoldCount(publicKey.toBase58()),
            amount * solanaPrice,
            'd',
          )
        } else {
          toast(`You have not enough Sol!`, {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'warn',
            position: 'top-left',
          })
        }
      } catch (err) {
        toast(err, {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'top-left',
        })
      }
    },
    [publicKey, sendTransaction, connection],
  )

  const updateGold = async (currentGold, gold, type) => {
    const putGold = async () => {
      let data
      if (type === 'd') {
        data = {
          publicKey: publicKey.toBase58(),
          gold: currentGold + gold,
        }
      } else {
        data = {
          publicKey: publicKey.toBase58(),
          gold: currentGold - gold,
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
          toast(`${gold.toFixed(2)} Gold is successfully PURCHASED!`, {
            hideProgressBar: true,
            autoClose: 2500,
            type: 'success',
            position: 'top-left',
          })
        else
          toast(`${gold.toFixed(2)} Gold is successfully SPENT!`, {
            hideProgressBar: true,
            autoClose: 2500,
            type: 'success',
            position: 'top-left',
          })
        refreshData()
      })
    } catch (err) {
      toast(err, {
        hideProgressBar: true,
        autoClose: 2500,
        type: 'error',
        position: 'top-left',
      })
    }
  }

  const postGoldAccount = async () => {
    const postGold = async () => {
      const data = {
        publicKey: publicKey.toBase58(),
        gold: 0,
      }
      const response = await fetch('/api/gold/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.json()
    }
    try {
      postGold().then(res => {
        if (JSON.stringify(res) !== '{}') {
          toast('QUACK account succesfully initialized!', {
            hideProgressBar: true,
            autoClose: 1500,
            type: 'success',
            position: 'top-left',
          })
        }
        refreshData()
      })
    } catch (err) {
      toast(err, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
        position: 'top-left',
      })
    }
  }

  const getGoldCount = publicKey => {
    const goldCount = gold.find(g => g.publicKey === publicKey)
    if (goldCount === undefined) {
      return 0
    }
    return goldCount.gold
  }

  const [goldAmount, setGoldAmount] = useState(
    getGoldCount(publicKey?.toBase58()),
  )

  useEffect(() => {
    if (publicKey !== null) {
      setGoldAmount(getGoldCount(publicKey.toBase58()))
    }
  })

  useEffect(() => {
    if (publicKey !== null) {
      getUserSOLBalance(publicKey, connection)
      postGoldAccount().then(() => {
        //toast('Connected!', { hideProgressBar: true, autoClose: 1000, type: 'success' ,position:"top-left"})
      })
    }
  }, [connected, getUserSOLBalance])

  return (
    <>
      <ToastContainer />
      <SlideShow />
      <Hero />
    </>
  )
}

export async function getServerSideProps() {
  const { db } = await connectToDatabase()

  const gold = await db.collection('gold').find().toArray()

  return {
    props: {
      gold: JSON.parse(JSON.stringify(gold)),
    },
  }
}
