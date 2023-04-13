// modules
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

// atoms
import { collapsedState } from '../../atoms/Atoms';

// styles
import { WalletOutlined } from '@ant-design/icons';
import { Layout, Menu as _Menu, Row, Col } from 'antd';
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';
import type { MenuProps } from 'antd';

const { Header: _Header } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label?: React.ReactNode,
  key?: React.Key | null,
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
  getItem('Market', 'market'),
  getItem('CDS', 'cds', null, [
    getItem('Create', 'create'),
    getItem('Accept', 'accept'),
  ]),

  getItem('MyPage', 'mypage'),
  getItem('', 'wallet', <WalletOutlined />),
];

const Nav: React.FC = () => {
  // search
  const [search, setSearch] = useState('');
  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
  };

  const navigate = useNavigate();
  const submitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    navigate(`/search/${search}`);
    setSearch('');
  };

  // wallet
  const [collapsed, setCollapsed] = useRecoilState(collapsedState);

  // menu
  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'wallet') {
      setCollapsed(!collapsed);
      return;
    }
    console.log('click', e.key);
    navigate(`/${e.key}`);
  };

  return (
    <Header>
      <Row wrap={false} justify={'space-between'} align="middle">
        <Col xs={{ span: 3, pull: 2 }} xl={{ span: 4, pull: 0 }}>
          <Link to="/">Home</Link>
        </Col>
        <Col>
          <div>
            <form onSubmit={submitHandler}>
              <input
                value={search}
                onChange={handleSearch}
                placeholder="Enter contracts / accounts address..."
              />
            </form>
          </div>
        </Col>
        <Col>
          <Menu
            mode="horizontal"
            style={{ justifyContent: 'flex-end' }}
            items={items}
            onClick={onClick}
          />
        </Col>
      </Row>
    </Header>
  );
};

// z-index: z축 순서.
// a: element for link. 링크에는 (더 세부적으로 들어갈 수도 있지만) 크게 link, visited, hover, active, focus 상태가 있다.
// link - href가 명시됨. visited - 클릭해봄. active - 좌클릭하고 있음, hover - 마우스 포인터가 위에 위치함, focus - 키보드 포커스가 위치함
const Header = styled(_Header)`
  background-color: ${styles.main_theme};
  color: ${styles.main_theme};
  z-index: 1000;
  a:link,
  a:visited,
  a:active,
  a:hover {
    text-decoration: none;
    color: ${styles.very_dark_blue_line};
  }
`;
const Menu = styled(_Menu)`
  background-color: ${styles.main_theme};
  color: ${styles.very_dark_blue_line};
`;

export default Nav;
