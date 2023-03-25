import 'styles/variables.css'
import 'styles/main.css'
import 'styles/nprogress.css'
import { ThemeProvider } from 'next-themes'
import nprogress from 'nprogress'
import Router from 'next/router'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { useMemo, useState } from 'react'
import { ContextProvider } from 'contexts/ContextProvider.tsx'
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import {
  createDefaultAuthorizationResultCache,
  SolanaMobileWalletAdapter,
} from '@solana-mobile/wallet-adapter-mobile'
require('@solana/wallet-adapter-react-ui/styles.css')
import { clusterApiUrl } from '@solana/web3.js'
import { Analytics } from '@vercel/analytics/react'
import Head from 'next/head'
import { Layout } from 'components'

Router.events.on('routeChangeStart', () => nprogress.start())
Router.events.on('routeChangeComplete', () => nprogress.done())
Router.events.on('routeChangeError', () => nprogress.done())

const network = 'devnet'

function MyApp({ Component, pageProps }) {
  const [solanaPrice, setSolanaPrice] = useState()
  const url = useMemo(() => clusterApiUrl(network), [])
  const wallets = useMemo(
    () => [
      new SolanaMobileWalletAdapter({
        appIdentity: { name: 'Solana Next.js Starter App' },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
      }),
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [network],
  )

  const imageStyle = {
    marginTop: '22px',
    position: 'relative',
    textAlign: 'center',
  }

  return (
    <>
      <Head>
        <title>Dacks</title>
      </Head>
      <ContextProvider>
        <ConnectionProvider endpoint={url}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <ThemeProvider>
                <Layout
                  title="Dacks"
                  desc="Explore video games like never before"
                  style={imageStyle}
                  setSolanaPrice={setSolanaPrice}
                >
                  <Component {...pageProps} />
                </Layout>
                <Analytics />
              </ThemeProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ContextProvider>
    </>
  )
}

export default MyApp
