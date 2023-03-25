// modules
import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Page Not Found."
      extra={
        <Link to="/">
          <Button type="primary">Home</Button>
        </Link>
      }
    />
  );
}

export default NotFound;
