import React from 'react'
import css from './styles.module.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'

import { BiArrowBack } from 'react-icons/bi'
import Image from 'next/image'

export default function SlideShow() {
  return (
    <div
      className={css.main}
      style={{
        marginTop: '50px',
        padding: '10px',
      }}
    >
      <Carousel
        showThumbs={false}
        showStatus={false}
        showIndicators={false}
        autoPlay={true}
        infiniteLoop={true}
        showArrows={false}
        transitionTime={500}
        animationHandler="fade"
        className={css.slider}
        // renderArrowPrev={(clickHandler, hasPrev) => (
        //   <div onClick={clickHandler} className={css.prevArrow}>
        //     <BiArrowBack className={css.arrowPrev} />
        //   </div>
        // )}
        // renderArrowNext={(clickHandler, hasNext) => (
        //   <div onClick={clickHandler} className={css.nextArrow}>
        //     <BiArrowBack className={css.arrowNext} />
        //   </div>
        // )}
      >
        <div>
          <img src="/slider/1.png" />
        </div>
        <div>
          <img src="/slider/1.png" />
        </div>
        <div>
          <img src="/slider/1.png" />
        </div>
      </Carousel>
    </div>
  )
}
