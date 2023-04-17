// modules
// import { EffectCoverflow, FreeMode, Pagination } from 'swiper';
import { Navigation } from 'swiper';
import React, { useEffect, useState } from 'react';
import { List } from 'antd';

// Import Swiper React components
import { Swiper as _Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import styled from 'styled-components';

import CDSCard from './CDSCard';

import { ICardProps } from '../../pages/MyPage/MyPage';

const CardList = ({ contracts }: { contracts: ICardProps[] }) => {
  return (
    <List
      grid={{ gutter: 12, xxl: 5, xl: 5, lg: 4, md: 4, sm: 3, xs: 2 }}
      dataSource={contracts}
      renderItem={(item) => (
        <List.Item>
          <CDSCard {...item} />
        </List.Item>
      )}
    />
  );
};

export default CardList;
