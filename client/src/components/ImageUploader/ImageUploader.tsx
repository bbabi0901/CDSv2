// react modules
import React, { useEffect, useState, MouseEvent } from 'react';

// antd
import { Typography, Button, message, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

// ipfs
import { create as ipfsHttpClient } from 'ipfs-http-client';
// import { IpfsImage } from "react-ipfs-image";

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// interface
import { ipfsProps } from '../../pages/Mint/Mint';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

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
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>
      <br />
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

const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const Description = styled(Paragraph)`
  color: ${styles.lynch};
  font-size: ${styles.fs_3};
`;

export default ImageUploader;
