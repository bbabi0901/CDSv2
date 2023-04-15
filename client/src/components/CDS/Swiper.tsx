// modules
// import { EffectCoverflow, FreeMode, Pagination } from 'swiper';
import { Navigation } from 'swiper';
import React, { useEffect, useState } from 'react';
import { Col, Row, Radio, RadioChangeEvent } from 'antd';

// Import Swiper React components
import { Swiper as _Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import styled from 'styled-components';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import CDSCard from './CDSCard';

import { ICardProps } from '../../pages/MyPage/MyPage';

const CdsSwiper = ({
  contracts,
  windowWidth,
}: {
  contracts: ICardProps[];
  windowWidth: number;
}) => {
  return (
    <Row>
      <Col>
        {contracts.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            slidesPerView={
              windowWidth > 1200
                ? 7
                : windowWidth > 720
                ? 5
                : windowWidth > 480
                ? 3
                : 2
            }
            navigation={true}
            spaceBetween={5}
            loop={true}
            freeMode={true}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper: any) => console.log('swiper', swiper)}
          >
            {contracts.map((contract) => {
              return (
                <SwiperSlide key={`slide_${contract.address}`}>
                  <CDSCard {...contract} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div>No result</div>
        )}
      </Col>
    </Row>
  );
};

const Swiper = styled(_Swiper)`
  width: 90%;
  height: 0px;
  background-color: #eff3f7;
  transition: all 0.3s ease;

  .swiper-slide {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }
  .swiper-button-prev,
  .swiper-button-next {
    background-color: rgba(240, 240, 240, 0.2);
    background-position: center;
    border-radius: 5px;
    width: 35px;
    height: 70px;
    color: rgba(159, 159, 159, 0.7);
    transition: 0.4s;
    font-weight: bold;
    margin-top: -50px;
  }
  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    color: rgba(68, 68, 68);
    transform: scale(1.1);
    background-color: rgb(245, 245, 245);
    text-shadow: 2px 2px rgb(200, 200, 200);
    box-shadow: 0 4px 12px rgba(131, 131, 131, 0.7);
  }
`;

export default CdsSwiper;
