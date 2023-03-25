// modules
import React from 'react';
import { useState } from 'react';
import { Layout } from 'antd';
import Web3 from 'web3';

// styles
import { styles } from './assets/styles/styles';

// components
import Router from './router/Router';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';

// atoms
import { walletState, IWalletTypes } from './atoms/Atoms';
import { useEffect } from 'react';

const { Content, Footer } = Layout;

function App() {
  return (
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
      <Sidebar />
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
  );
}

export default App;
