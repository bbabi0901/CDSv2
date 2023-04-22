// modules
import React, { useEffect, useState, MouseEvent } from 'react';
import { Col, Row, Typography, Input, Divider, Button, Space } from 'antd';

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// component
import ImageUploader from '../../components/Mint/ImageUploader';

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

  useEffect(() => {}, []);

  return (
    <Row justify="center" align="middle" gutter={{ md: 24, xs: 12, sm: 16 }}>
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
        <Divider />
        <br />
        <ImageUploader addIpfsData={addIpfsDataHandler} />
        <Divider />
        <br />
        <Title level={4}>Name *</Title>
        <Input placeholder="Item name" />
        <Divider />
        <br />
        <Title level={4}>Description *</Title>
        <TextArea
          showCount
          maxLength={1000}
          rows={6}
          placeholder="Provide a detail description to your item"
        />
        <br />
        <br />
        <Row justify="center">
          <PreviewButton onClick={(e) => console.log(e.target)}>
            Preview
          </PreviewButton>
          <MintButton onClick={(e) => console.log(e.target)}>Mint</MintButton>
        </Row>
      </Col>
    </Row>
  );
};

const PreviewButton: typeof Button = styled(Button)`
  margin-top: 24px;
  margin-left: 30px;
  width: 150px;
  height: 50px;
  background-color: ${styles.white};
  font-size: ${styles.fs_6};
`;

const MintButton: typeof Button = styled(Button)`
  margin-top: 24px;
  margin-left: 30px;
  width: 150px;
  height: 50px;
  background-color: ${styles.main_theme_lighter};
  color: ${styles.white};
  font-size: ${styles.fs_6};
`;

const Description: typeof Paragraph = styled(Paragraph)`
  color: ${styles.lynch};
  font-size: ${styles.fs_3};
`;

export default Mint;
