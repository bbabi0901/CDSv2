// module
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

import Router from './router/Router';

// components
import Nav from './components/Nav/Nav';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Router />
    </BrowserRouter>
  );
}

export default App;
