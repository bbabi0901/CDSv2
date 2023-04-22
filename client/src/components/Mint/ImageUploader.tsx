// react modules
import React, { useEffect, useState, MouseEvent } from 'react';

// antd
import { Typography, Button, Row, Col } from 'antd';
import { FileImageOutlined, UserOutlined } from '@ant-design/icons';

// ipfs
import { create as ipfsHttpClient } from 'ipfs-http-client';

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// interface
import { ipfsProps } from '../../pages/Mint/Mint';

const { Title, Paragraph } = Typography;

const API_KEY = process.env.REACT_APP_API_KEY;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const ImageUploader = (props: ipfsProps) => {
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageFile, setImageFile] = useState<File>();
  const [imgMouseOver, setImgMouseOver] = useState<boolean>(false);

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
  const uploadHandler = async (event: MouseEvent) => {
    event.preventDefault();

    if (!imageFile) {
      return alert('No files selected');
    }

    const result = await ipfs.add(imageFile);
    setIpfsHash(result.path);
    props.addIpfsData(result.path);
    setIsUploaded(true);
  };

  return (
    <>
      <Title level={4}>Image *</Title>
      <Description>File types supported: JPG, JPEG, PNG.</Description>
      <br />

      <Row justify="center">
        {!imageSrc ? (
          <label htmlFor="ex_file">
            <PreviewDefault
              className="preview-default"
              align="middle"
              justify="center"
            >
              <FileImageOutlined style={{ fontSize: '1000%' }} />
            </PreviewDefault>
          </label>
        ) : (
          <Row
            className="preview"
            justify="center"
            align="middle"
            style={{ position: 'relative', width: '600px', height: '400px' }}
            onMouseOver={() => {
              setImgMouseOver(true);
            }}
            onMouseLeave={() => {
              setImgMouseOver(false);
            }}
          >
            {imageSrc && (
              <Img className="img-selected" src={imageSrc} alt="img-preview" />
            )}
            {imgMouseOver ? (
              <div>
                <Button
                  style={{ position: 'absolute', top: '200px', left: '150px' }}
                >
                  BTN1
                </Button>
                <Button
                  style={{ position: 'absolute', top: '200px', left: '300px' }}
                >
                  BTN2
                </Button>
              </div>
            ) : (
              ''
            )}
          </Row>
        )}
      </Row>
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        id="ex_file"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            const imageFile = e.target.files[0];
            setImageFile(imageFile);
            getBase64(imageFile);
          }
        }}
      />
      <br />
      <br />
      {imageFile ? (
        isUploaded ? (
          <Button
            onClick={() => {
              window.open(`https://ipfs.io/ipfs/${ipfsHash}`);
            }}
          >
            Upload succeed! Click to see.
          </Button>
        ) : (
          <Button onClick={uploadHandler}>Upload on IPFS</Button>
        )
      ) : (
        ''
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
    cursor: pointer;
  }
`;

const Img = styled.img`
  height: 400px;
  width: 600px;
  &:hover {
    filter: brightness(0.7);
  }
`;

const Description: typeof Paragraph = styled(Paragraph)`
  color: ${styles.lynch};
  font-size: ${styles.fs_3};
`;

export default ImageUploader;
