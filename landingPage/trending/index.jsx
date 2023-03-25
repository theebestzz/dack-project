import { Button, Container, LinkButton } from 'components'
import css from './styles.module.css'
import cn from 'classnames'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export const Trending = () => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={cn(css.trending, isDark ? css.dark : css.light)}>
      <Container sx={css.container}>
        <h1 className={css.title}>DACKS</h1>
        <p className={cn(css.info, css.trendingInfo)}>
        Web3 gaming platform that uses blockchain technology for fairness.
        <br/>
        Offers a variety of games and a wallet-based membership system 
        that rewards top contributors and NFT holders.
        </p>
        <LinkButton href="/" margin="0.6rem 0" active>
          Checkout
        </LinkButton>
      </Container>
    </div>
  )
}
