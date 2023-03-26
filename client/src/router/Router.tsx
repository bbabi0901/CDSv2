// module
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

// pages
import Home from '../pages/Home/Home';
import Search from '../pages/Search/Search';
import Market from '../pages/Market/Market';
import Create from '../pages/Create/Create';
import Accept from '../pages/Accept/Accept';
import MyPage from '../pages/MyPage/MyPage';
import NotFound from '../pages/NotFound';

// abi
import { cdsLoungeAbi, cdsLoungeAddress } from '../assets/abi/cdsLounge';

function Router() {
  const [web3, setWeb3] = useState<Web3 | null>();
  const [cdsLounge, setCdsLounge] = useState<Contract | null>(null);
  useEffect(() => {
    const web = new Web3(Web3.givenProvider || 'https://localhost:8545');
    setWeb3(web);

    const contract = new web.eth.Contract(
      cdsLoungeAbi as AbiItem[],
      cdsLoungeAddress,
    );
    setCdsLounge(contract);
  }, []);
  return (
    <Routes>
      <Route path={'/'} element={<Home />} />
      <Route path={'/search/:address'} element={<Search />} />
      <Route path={'/market'} element={<Market />} />
      <Route path={'/create'} element={<Create />} />
      <Route path={'/accept'} element={<Accept />} />
      <Route path={'/mypage'} element={<MyPage cdsLounge={cdsLounge} />} />
      <Route path={'/*'} element={<NotFound />} />
    </Routes>
  );
}

export default Router;
