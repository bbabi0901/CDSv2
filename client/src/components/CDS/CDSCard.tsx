// modules
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  address: string;
  prices: string[];
};

const CDSCard: React.FC<Props> = ({ address, prices }) => {
  return (
    <Link to={`/search/${address}`}>
      <div>
        <div>-----</div>
        <div>{address}</div>
        <div>{prices[0]}</div>
        <div>{prices[1]}</div>
        <div>{prices[2]}</div>
        <div>{prices[3]}</div>
        <div>{prices[4]}</div>
        <div>-----</div>
      </div>
    </Link>
  );
};

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
