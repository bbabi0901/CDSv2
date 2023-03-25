// modules
import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Wallet Not Found."
      extra={
        <Link to="/">
          <Button type="primary">Home</Button>
        </Link>
      }
    />
  );
};

export default NotAuthorized;
