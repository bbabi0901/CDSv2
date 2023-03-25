// modules
import React from 'react';
import { SetterOrUpdater } from 'recoil';
import { MetaMaskInpageProvider } from '@metamask/providers';

// styles
import type { MenuProps } from 'antd';
import { Menu, List as _List } from 'antd';
import { ReactComponent as MetamaskIcon } from '../../assets/icons/metamask-icon.svg';
import { ReactComponent as KlaytnIcon } from '../../assets/icons/klaytn-icon.svg';
import { styles } from '../../assets/styles/styles';

// atoms
import { IWalletTypes } from '../../atoms/Atoms';

interface Props {
  wallet: IWalletTypes;
  setWallet: SetterOrUpdater<IWalletTypes>;
}

const NotLinked = ({ wallet, setWallet }: Props) => {
  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
    } as MenuItem;
  }

  const items: MenuItem[] = [
    getItem('Metamask', '1', <MetamaskIcon width={`${styles.fs_5}`} />),
    getItem('Klaytn', '2', <KlaytnIcon width={`${styles.fs_5}`} />),
  ];

  const eth = window.ethereum as MetaMaskInpageProvider;

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
    if (accounts && Array.isArray(accounts)) {
      setWallet({
        ...wallet,
        address: accounts[0],
        // network: networkId,
        isLinked: true,
      });
    } else {
      console.log('accounts not found');
    }
  };

  return (
    <Menu
      theme="dark"
      defaultSelectedKeys={['1']}
      mode="inline"
      items={items}
      onClick={connWallet}
    />
  );
};

export default NotLinked;
