import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import App from './App';

import './index.css';

library.add(fas);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  // <React.StrictMode>
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  // </React.StrictMode>,
);
