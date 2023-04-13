// modules
import React, { useState } from 'react';
import { Layout, Space } from 'antd';

// styles
import { styles } from './assets/styles/styles';

// components
import Router from './router/Router';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';

const { Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Layout
        className="layout"
        style={{
          height: '100%',
          background: `linear-gradient(${styles.main_theme}, ${styles.white} )`,
          color: `${styles.very_dark_blue_line}`,
          gap: `${styles.space_8}`,
        }}
      >
        <Header />
        <Content
          style={{
            padding: '0 50px',
            display: 'flex',
            flexDirection: 'column',
            gap: `${styles.space_9}`,
          }}
          className="site-layout-content"
        >
          <Router />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©2023 Created by Ant UED
        </Footer>
      </Layout>
      <Sidebar />
    </Space>
  );
};

export default App;
