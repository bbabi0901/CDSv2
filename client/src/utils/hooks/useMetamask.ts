// modules
import { useEffect, useState } from 'react';
import { MetaMaskInpageProvider } from '@metamask/providers';

const useMetamask = () => {
  const defaultState = {
    address: '',
    isLinked: false,
  };
  const [metamask, setMetamask] = useState(defaultState);
  // atoms에 설정 setState.
  const eth = window.ethereum as MetaMaskInpageProvider;

  const accountChangeHandler = async () => {
    const account = await eth.request({
      method: 'eth_requestAccounts',
    });
    console.log(account);
  };

  const checkChainId = async () => {
    const chainId = await eth.request({
      method: 'eth_chainId',
    });
    console.log(chainId);
  };

  useEffect(() => {
    if (!window.ethereum) {
      const err = new Error('No installed Metamask');
      console.log(err);
      setMetamask(defaultState);
    } else {
      window.ethereum.on('accountsChanged', accountChangeHandler);
      console.log('metamask', window.ethereum);
      setMetamask({ ...metamask, address: '', isLinked: true });
      checkChainId();
    }
  }, []);

  return metamask;
};

export default useMetamask;
