// react modules
import React, { useEffect, useState, MouseEvent } from 'react';

// antd
import { Typography, Button, Row, Col } from 'antd';

// style
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// interface
import { metaDataProps } from '../../pages/Mint/Mint';

const { Title, Paragraph } = Typography;

// props => metadata
const Preview: React.FC<metaDataProps> = (props) => {
  console.log('modal', props);
  return (
    <>
      <img alt="preview" style={{ width: '100%' }} src={props.imageSrc}></img>
      <p>
        {props.name} written by {props.writer}
      </p>
      <p>{props.description}</p>
    </>
  );
};

export default Preview;
