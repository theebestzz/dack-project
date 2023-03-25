import { ThemeSwitch } from 'components/themeSwitch'
import css from './styles.module.css'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import useUserSOLBalanceStore from 'stores/useUserSOLBalanceStore.tsx'
import { useEffect, useState } from 'react'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'

export const Footer = ({ setPrice }) => {
  const { connected, wallet, publicKey } = useWallet()
  const { connection } = useConnection()
  const [solanaPrice, setSolanaPrice] = useState()

  const { getUserSOLBalance } = useUserSOLBalanceStore()
  const year = new Date().getFullYear()

  useEffect(() => {
    if (publicKey !== null) {
      console.log(publicKey.toBase58())
      getUserSOLBalance(publicKey, connection)
    }
  }, [connected, getUserSOLBalance])

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

  return (
    <footer className={css.footer}>
      <div className="flex items-center justify-center">
        <div className="text-xs md:text-base">
          <p>Dacks Games © {year} All rights reserved</p>
          Sol: {solanaPrice} USDC
        </div>
        <div className="right-3 absolute justify-end">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
