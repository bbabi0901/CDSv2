// modules
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card as _Card, List } from 'antd';

// styles
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

import { ICardProps } from '../../pages/MyPage/MyPage';

const { Meta } = _Card;

const CDSCard: React.FC<ICardProps> = (detail) => {
  let imgSrc;
  switch (detail.asset) {
    case 'BTC':
      imgSrc = styles.card_BTC;
      break;
    case 'ETH':
      imgSrc = styles.card_ETH;
      break;
    case 'LINK':
      imgSrc = styles.card_LINK;
      break;
    default:
      break;
  }
  const cardClickHandler: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // console.log(e);
  };
  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={<img alt="asset_type_card" src={imgSrc} />}
      onClick={cardClickHandler}
    >
      <Meta
        title={detail.address}
        description={detail.isBuyer ? 'Buyer' : 'Seller'}
      />
      <Meta description={detail.status} />
    </Card>
  );
};

const Card = styled(_Card)``;

export default CDSCard;

/*

cds contract는
card에는 간략한 인포만 있으면 되서 필요없고 (얘는 props로 data만 건내주고 클릭하면 search/{addredss}로 이동하도록)
아마 search 페이지에서 필요할듯 address 가지고 자세한 정보

cds lounge contract는
create, accept에서

market에서는 pending인거만 다룰거고
이거는 온체인 데이터와 관련 x
작성한거 오퍼 => 참여 되면 state 그대로 create로 가져오도록

*/
