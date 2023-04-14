// modules
// import { EffectCoverflow, FreeMode, Pagination } from 'swiper';
import React, { useState } from 'react';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import CDSCard from './CDSCard';

import { ICardProps } from '../../pages/MyPage/MyPage';

const CdsSwiper = ({ contracts }: { contracts: ICardProps[] }) => {
  const [index, setIndex] = useState(7);

  return (
    <Swiper
      slidesPerView={7}
      spaceBetween={15}
      freeMode={true}
      centeredSlides={true}
      pagination={{
        clickable: true,
      }}
      effect={'coverflow'}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 200,
        modifier: 1,
        slideShadows: false,
      }}
      onSlideChange={() => console.log('slide change')}
      onSwiper={(swiper: any) => console.log('swiper', swiper)}
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
      <SwiperSlide>Slide 4</SwiperSlide>
      ...
    </Swiper>
  );
};

export default CdsSwiper;
