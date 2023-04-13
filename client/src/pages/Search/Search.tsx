// modules
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row } from 'antd';

const Search: React.FC = () => {
  const { address } = useParams();
  const [prices, setPrices] = useState([]);

  return (
    <Row justify="center" align="middle">
      <Col span={24}>
        <div>{`Search for ${address}`}</div>
      </Col>
    </Row>
  );
};

export default Search;
