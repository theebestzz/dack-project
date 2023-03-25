import { Footer, Navigation } from 'components'
import Loby from 'components/loby'
import { NextSeo } from 'next-seo'
import css from './styles.module.css'

export const Layout = ({ children, title, desc, image, setSolanaPrice }) => {
  const setPrice = sp => {
    setSolanaPrice(sp)
  }

  const og = 'https://www.linkpicture.com/q/dacks.jpeg'
  return (
    <>
      <NextSeo
        title={title}
        description={desc}
        additionalLinkTags={[{ rel: 'icon', href: '/favicon.ico' }]}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0',
          },
        ]}
        openGraph={{
          url: 'https://dacks.xyz/',
          title: title,
          description: desc,
          locale: 'en_us',
          images: [
            {
              url: image ? image : og,
              width: 1200,
              height: 630,
              alt: title,
              type: 'image/jpeg',
            },
          ],
          site_name: 'Dacks',
        }}
        twitter={{
          handle: '@DacksNFT',
          site: '@DacksNFT',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation setPrice={setPrice} />
      <Loby />
      <main
        id="main"
        className={css.main}
        style={{
          minHeight: '-webkit-fill-available',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
