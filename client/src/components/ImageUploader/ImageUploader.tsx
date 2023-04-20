// modules
import React, { useEffect, useState, MouseEvent } from 'react';
import { Typography, Button } from 'antd';

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// interface
import { ipfsProps } from '../../pages/Mint/Mint';

const { Title, Paragraph } = Typography;

const ImageUploader = (props: ipfsProps) => {
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string>('');

  const clickUploadHandler = (e: MouseEvent): void => {
    e.preventDefault();
    const sampleStr = 'sample string of ipfs';
    setIpfsHash(sampleStr);
    props.addIpfsData(sampleStr);
    setIsUploaded(true);
  };

  return (
    <>
      <Title level={4}>Image *</Title>
      <Description>
        File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB,
        GLTF. Max size: 100 MB
      </Description>
      {isUploaded ? (
        <div>
          <Button disabled type="text">
            {ipfsHash}
          </Button>
        </div>
      ) : (
        <Button onClick={clickUploadHandler}>Upload on IPFS</Button>
      )}
    </>
  );
};

const Description = styled(Paragraph)`
  color: ${styles.lynch};
  font-size: ${styles.fs_3};
`;

export default ImageUploader;
