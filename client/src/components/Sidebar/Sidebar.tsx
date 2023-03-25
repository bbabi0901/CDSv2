// modules
import React from 'react';
import { Layout } from 'antd';
import { useRecoilState } from 'recoil';
import { MetaMaskInpageProvider } from '@metamask/providers';

// atoms
import { collapsedState, walletState, IWalletTypes } from '../../atoms/Atoms';

const { Sider } = Layout;

const Sidebar = () => {
  const eth = window.ethereum as MetaMaskInpageProvider;

  const [collapsed, setCollapsed] = useRecoilState(collapsedState);
  const [wallet, setWallet] = useRecoilState(walletState);

  const connWallet = async () => {
    if (!eth) {
      window.alert('Metamask uninstalled!');
      return;
    }

    const accounts = await eth.request({
      method: 'eth_requestAccounts',
    });

    const networkId = await eth.request({
      method: 'net_version',
    });

    // const networkName = getNetworkName(networkId);
    setWallet({
      ...wallet,
      address: accounts[0],
    });
  };
  return (
    <Sider collapsible collapsed={collapsed} trigger={null}>
      <p>hhhh</p>
    </Sider>
  );
};

// const SidebarWrapper = styled.div``;
export default Sidebar;
