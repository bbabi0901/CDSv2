// modules
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { Layout } from 'antd';

// styles
import { theme } from './assets/styles/theme';

// components
import Router from './router/Router';
import Nav from './components/Nav/Nav';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  return (
    <BrowserRouter>
      <Layout
        className="layout"
        style={{
          height: '100%',
          background: `linear-gradient(${theme.very_light_blue_main}, ${theme.white} )`,
          color: `${theme.very_dark_blue_line}`,
          gap: `${theme.space_8}`,
        }}
      >
        <Nav />
        <Sidebar />
        <Router />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
