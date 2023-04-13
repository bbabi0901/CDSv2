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
  const mouseLeaveHandler: React.MouseEventHandler<HTMLDivElement> = () => {
    setCollapsed(true);
  };
  /*
  MouseOver/Out : 지정된 태그 요소(혹은 자신)는 물론이며, 자식 요소가 있다면 해당 자식요소의 영역까지 포함됨
  MouseEnter/Leave : 지정된 태그 요소(혹은 자신)의 영역에만 해당되며, 만약 자식요소가 있다면 해당 자식요소의 영역은 제외됨
  */
  return (
    <Sider
      onMouseLeave={mouseLeaveHandler}
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
      {wallet.isLinked ? (
        <Linked wallet={wallet} />
      ) : (
        <NotLinked wallet={wallet} setWallet={setWallet} />
      )}
    </Sider>
  );
};

export default Sidebar;
