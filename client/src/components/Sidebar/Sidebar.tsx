// modules
import React from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

// styles
import { Layout, List as _List } from 'antd';

// atoms
import { collapsedState, walletState } from '../../atoms/Atoms';

// components
import NotLinked from './NotLinked';
import Linked from './Linked';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useRecoilState(collapsedState);
  const [wallet, setWallet] = useRecoilState(walletState);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      collapsedWidth={0}
      defaultCollapsed={true}
      trigger={null}
      width={`${1200 < window.innerWidth ? '20vw' : '100%'}`}
      style={{
        maxWidth: '100%',
        position: 'fixed',
        zIndex: 500,
        top: 64,
        right: 0,
        height: '100vh',
      }}
    >
      <SidebarWrapper>
        {wallet.isLinked ? (
          <Linked wallet={wallet} />
        ) : (
          <NotLinked wallet={wallet} setWallet={setWallet} />
        )}
      </SidebarWrapper>
    </Sider>
  );
};

const SidebarWrapper = styled.div``;
export default Sidebar;
