import { Container } from 'components'
import Link from 'next/link'
import css from './styles.module.css'

export const Hero = () => {
  return (
    <Container gap sx={css.header}>
      <div className={css.gamesTitle}>Dacks Games Original</div>
      <div className={css.gamesMain}>
        <Link href="/">
          <a className={css.gamesLink}>
            <img src="/games/1.jpg" />
          </a>
        </Link>
        <Link href="/">
          <a className={css.gamesLink}>
            <img src="/games/2.jpg" />
          </a>
        </Link>
        <Link href="/uno">
          <a className={css.gamesLink}>
            <img src="/games/3.jpg" />
          </a>
        </Link>
      </div>
    </Container>
  )
}
