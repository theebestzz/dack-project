import { Container } from 'components'
import css from './styles.module.css'
import { DacksLogo, Dex} from 'assets'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { isBrowser } from 'react-device-detect'
import Image from 'next/image'

export const Platforms = () => {
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Container gap>
      <h1 className={css.tit}>TEAM MEMBERS</h1>
      <ul className={css.list}>
        {data.map(platform => {
          const { title, key, lightClr, darkClr, animDelay } = platform
          return (
            <motion.li
              key={key}
              className={css.platform}
              style={{ color: isDark ? darkClr : lightClr }}
              initial={{ opacity: 0, y: 100, scale: 0 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: isBrowser ? animDelay : 0 }}
            >
              <div style={{borderRadius: '50%', overflow: 'hidden', margin: "10px"}}>

                <Image
                  src={Dex}
                  alt="Picture of the author"
                  width="300px"
                  height="300px"
                  border
                />

              </div>
              
              <div style={{margin: "10px"}}>
                {title}
              </div>
            </motion.li>
          )
        })}
      </ul>
    </Container>
  )
}

const data = [
  {
    title: 'Daffy',
    darkClr: '#00a6fb',
    lightClr: '#006FCD',
    animDelay: 0,
    key: 'Ah7^k',
  },
  {
    title: 'Spotty',
    darkClr: '#70e000',
    lightClr: '#107C11',
    animDelay: 0.2,
    key: 'LkU%',
  },
  {
    title: 'Dexxter',
    darkClr: '#e60012',
    lightClr: '#e60012',
    animDelay: 0.4,
    key: 'lK&v',
  },
  {
    title: 'Malikz',
    darkClr: '#dee2e6',
    lightClr: '#6c757d',
    animDelay: 0.4,
    key: 'Xe$#',
  },
]
