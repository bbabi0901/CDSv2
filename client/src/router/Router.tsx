// module
import { Routes, Route } from 'react-router-dom';
import React from 'react';

// pages
import Home from '../pages/Home/Home';
import Search from '../pages/Search/Search';
import Market from '../pages/Market/Market';
import Create from '../pages/Create/Create';
import Accept from '../pages/Accept/Accept';
import MyPage from '../pages/MyPage/MyPage';
import NotFound from '../pages/NotFound';

function Router() {
  return (
    <Routes>
      <Route path={'/'} element={<Home />} />
      <Route path={'/search/:address'} element={<Search />} />
      <Route path={'/market'} element={<Market />} />
      <Route path={'/create'} element={<Create />} />
      <Route path={'/accept'} element={<Accept />} />
      <Route path={'/mypage'} element={<MyPage />} />
      <Route path={'/*'} element={<NotFound />} />
    </Routes>
  );
}

export default Router;
