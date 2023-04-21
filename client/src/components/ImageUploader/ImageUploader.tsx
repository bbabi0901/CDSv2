// react modules
import React, { useEffect, useState, MouseEvent } from 'react';

// antd
import { Typography, Button, Row, Col } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

// ipfs
import { create as ipfsHttpClient } from 'ipfs-http-client';
// import { IpfsImage } from "react-ipfs-image";

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// interface
import { ipfsProps } from '../../pages/Mint/Mint';

const { Title, Paragraph } = Typography;

const API_KEY = process.env.REACT_APP_API_KEY;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const ImageUploader = (props: ipfsProps) => {
  const authorization =
    'Basic ' + Buffer.from(API_KEY + ':' + SECRET_KEY).toString('base64');
  const ipfs = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization,
    },
  });

  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string>('');

  const [imageSrc, setImageSrc] = useState('');
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
    });

  const uploadHandler = async (event: MouseEvent) => {
    event.preventDefault();
    console.log('Handling', imageSrc);

    const sampleStr = 'sample string of ipfs';
    setIpfsHash(sampleStr);
    props.addIpfsData(sampleStr);
    setIsUploaded(true);
  };

  return (
    <>
      <Title level={4}>Image *</Title>
      <Description>File types supported: JPG, JPEG, PNG.</Description>
      <br />

      <Row justify="center">
        {!imageSrc ? (
          <PreviewDefault
            className="preview-default"
            align="middle"
            justify="center"
          >
            <FileImageOutlined style={{ fontSize: '1000%' }} />
          </PreviewDefault>
        ) : (
          <Row className="preview" justify="center" align="middle">
            {imageSrc && (
              <img
                style={{ height: '400px', width: '600px' }}
                src={imageSrc}
                alt="img-preview"
              />
            )}
          </Row>
        )}
      </Row>
      <br />

      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => {
          if (e.target.files) {
            getBase64(e.target.files[0]);
          }
        }}
      />
      <br />
      <br />

      {isUploaded ? (
        <div>
          <Button disabled type="text">
            {ipfsHash}
          </Button>
        </div>
      ) : (
        <Button onClick={uploadHandler}>Upload on IPFS</Button>
      )}
    </>
  );
};

const PreviewDefault: typeof Row = styled(Row)`
  border: 2px dashed;
  height: 400px;
  width: 600px;
  background: ${styles.white};
  border-radius: ${styles.radius_15};
  &:hover {
    background-color: ${styles.gray};
  }
`;

const Description: typeof Paragraph = styled(Paragraph)`
  color: ${styles.lynch};
  font-size: ${styles.fs_3};
`;

export default ImageUploader;
