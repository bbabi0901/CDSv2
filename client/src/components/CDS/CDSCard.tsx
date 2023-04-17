// modules
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card as _Card } from 'antd';

// styles
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

import { ICardProps } from '../../pages/MyPage/MyPage';

const { Meta } = _Card;

const CDSCard: React.FC<ICardProps> = (contract) => {
  let imgSrc;
  switch (contract.asset) {
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
    console.log(e.target);
  };
  useEffect(() => {
    console.log(contract);
  }, []);

  return (
    <Link to={`/search/${contract.address}`}>
      <Card
        key={contract.address}
        hoverable
        cover={<img alt="asset_type_card" src={imgSrc} height={150} />}
        onClick={cardClickHandler}
      >
        <Meta title={contract.address} description={contract.claimPrice} />
        <Meta description={contract.status} />
      </Card>
    </Link>
  );
};

const Card = styled(_Card)``;

export default CDSCard;
