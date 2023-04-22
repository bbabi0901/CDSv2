// modules
import React, { useEffect, useState, MouseEvent } from 'react';
import { Col, Row, Typography, Input, Divider, Button, Modal } from 'antd';

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// component
import ImageUploader from '../../components/Mint/ImageUploader';
import Preview from '../../components/Mint/Preview';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export interface ipfsProps {
  addIpfsData: (hash: string, src: string) => void;
}

export interface metaDataProps {
  writer: string;
  collection: string;
  ipfsHash: string;
  imageSrc: string;
  name: string;
  description: string;
}

const Mint: React.FC = () => {
  const [metaData, setMetaData] = useState<metaDataProps>({
    writer: '',
    collection: '',
    ipfsHash: '',
    imageSrc: '',
    name: '',
    description: '',
  });
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const addIpfsDataHandler = (hash: string, src: string) => {
    setMetaData({ ...metaData, ipfsHash: hash, imageSrc: src });
  };

  // wallet 체크하고 연결 되어있으면 metaData의 writer를 wallet.address로
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
        <Input
          placeholder="Collection name"
          onChange={(e) => {
            setMetaData({ ...metaData, collection: e.target.value });
          }}
        />
        <Divider />
        <br />
        <ImageUploader addIpfsData={addIpfsDataHandler} />
        <Divider />
        <br />
        <Title level={4}>Name *</Title>
        <Input
          placeholder="Item name"
          onChange={(e) => {
            setMetaData({ ...metaData, name: e.target.value });
          }}
        />
        <Divider />
        <br />
        <Title level={4}>Description *</Title>
        <TextArea
          showCount
          maxLength={1000}
          rows={6}
          placeholder="Provide a detail description to your item"
          onChange={(e) => {
            setMetaData({ ...metaData, description: e.target.value });
          }}
        />
        <br />
        <br />

        <PreviewButton
          onClick={(e) => {
            setPreviewOpen(true);
            console.log(metaData);
          }}
        >
          Preview
        </PreviewButton>
        <MintButton onClick={(e) => console.log(e.target)}>Mint</MintButton>
      </Col>
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Preview {...metaData} />
      </Modal>
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
