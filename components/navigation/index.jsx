import Link from 'next/link'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import useUserSOLBalanceStore from 'stores/useUserSOLBalanceStore.tsx'
import { Menu, Transition, Dialog, Tab } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { DacksLogo } from 'assets'
import Image from 'next/image'
import { ThemeSwitch } from 'components/themeSwitch'
import { Uno } from 'components/icons/Uno'
import 'react-dropdown/style.css'
import { HiMenuAlt3 } from 'react-icons/hi'
import { MdOutlineDashboard } from 'react-icons/md'

export const Navigation = () => {
  const { connected, wallet, publicKey } = useWallet()
  const { connection } = useConnection()
  const [solanaPrice, setSolanaPrice] = useState()

  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (publicKey !== null) {
      console.log(publicKey.toBase58())
      getUserSOLBalance(publicKey, connection)
    }
  }, [publicKey, getUserSOLBalance, connection])

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

  const [open, setOpen] = useState(true)

  const navRef = useRef()

  const showNavbar = () => {
    navRef.current.classList.toggle('responsiveNav')
  }
  return (
    <>
      <div className="headerMain h-[65px] flex flex-row items-center justify-between sticky top-0 p-5">
        <div className="flex items-center gap-5">
          <HiMenuAlt3
            size={26}
            className="cursor-pointer logoIcon"
            onClick={showNavbar}
          />
          <Link href="/">
            <a>
              <Image
                src={DacksLogo}
                width={50}
                height={50}
                alt="Dacks"
                title="Dacks"
                className="rounded-full"
              />
            </a>
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <div className="walletButton">
            <WalletMultiButton id="connect" />
          </div>
        </div>
      </div>
      <div
        className={`sidebarMain h-screen fixed z-10 menuRes ${
          open ? 'w-16' : 'w-64'
        } duration-500 text-white px-5`}
        ref={navRef}
      >
        <div className="py-5 flex justify-end">
          <HiMenuAlt3
            size={26}
            className="cursor-pointer sidebarIcon"
            onClick={() => setOpen(!open)}
          />
          <HiMenuAlt3
            size={26}
            className="cursor-pointer sidebarIcon1"
            onClick={() => showNavbar()}
          />
        </div>
        <div className="flex flex-col gap-5 mt-12">
          <Link href="/uno">
            <a className="group flex items-center text-sm gap-3.5 font-medium rounded-md mt-5">
              <div>
                <Uno />
              </div>
              <h2 className={`text-xl font-semibold ${open ? 'hidden' : ''}`}>
                Uno
              </h2>
              <h2
                className={`absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit ${
                  open ? '' : 'hidden'
                }`}
              >
                Uno
              </h2>
            </a>
          </Link>
          <Link href="/uno">
            <a className="group flex items-center text-sm gap-3.5 font-medium rounded-md mt-5">
              <div>
                <Uno />
              </div>
              <h2 className={`text-xl font-semibold ${open ? 'hidden' : ''}`}>
                Uno
              </h2>
              <h2
                className={`absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit ${
                  open ? '' : 'hidden'
                }`}
              >
                Uno
              </h2>
            </a>
          </Link>
          <Link href="/uno">
            <a className="group flex items-center text-sm gap-3.5 font-medium rounded-md mt-5">
              <div>
                <Uno />
              </div>
              <h2 className={`text-xl font-semibold ${open ? 'hidden' : ''}`}>
                Uno
              </h2>
              <h2
                className={`absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit ${
                  open ? '' : 'hidden'
                }`}
              >
                Uno
              </h2>
            </a>
          </Link>
          <Link href="/uno">
            <a className="group flex items-center text-sm gap-3.5 font-medium rounded-md mt-5">
              <div>
                <Uno />
              </div>
              <h2 className={`text-xl font-semibold ${open ? 'hidden' : ''}`}>
                Uno
              </h2>
              <h2
                className={`absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit ${
                  open ? '' : 'hidden'
                }`}
              >
                Uno
              </h2>
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}
