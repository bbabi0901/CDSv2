// module
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

// pages
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import MyPage from './pages/MyPage/MyPage';

// components
import Nav from './components/Nav/Nav';

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path={'/'} element={<Home />} />
        <Route path={'/search/:address'} element={<Search />} />
        <Route path={'/mypage'} element={<MyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
