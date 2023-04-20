// modules
import React, { useEffect, useState, MouseEvent } from 'react';
import { Col, Row, Typography, Input, Button } from 'antd';

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// component
import ImageUploader from '../../components/ImageUploader/ImageUploader';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export interface ipfsProps {
  addIpfsData: (hash: string) => void;
}

const Mint: React.FC = () => {
  const [metaData, setMetaData] = useState({
    image: 'test',
    name: '',
    description: '',
  });

  const addIpfsDataHandler = (hash: string) => {
    setMetaData({ ...metaData, image: hash });
  };

  useEffect(() => {
    console.log(metaData);
  }, [metaData.image]);

  return (
    <Row justify="center" align="middle" gutter={{ md: 24 }}>
      <Col md={12}>
        <Title>Create New Page</Title>
        <br />
        <br />
        <Description>* Required fields</Description>
        <Title level={4}>Collection *</Title>
        <Description>
          This is the collection where your item will appear.
        </Description>
        <Input placeholder="Item name" />
        <br />
        <br />
        <ImageUploader addIpfsData={addIpfsDataHandler} />
        <br />
        <br />
        <Title level={4}>Name *</Title>
        <Input placeholder="Item name" />
        <br />
        <br />
        <Title level={4}>Description *</Title>
        <TextArea
          showCount
          maxLength={1000}
          rows={6}
          placeholder="Provide a detail description to your item"
        />
      </Col>
    </Row>
  );
};

const Description = styled(Paragraph)`
  color: ${styles.lynch};
  font-size: ${styles.fs_3};
`;

export default Mint;
