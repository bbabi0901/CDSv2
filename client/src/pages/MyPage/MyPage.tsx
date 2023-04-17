// modules
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { Col, Row, Avatar, Radio, RadioChangeEvent, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

// styles
import styled from 'styled-components';
import { styles } from '../../assets/styles/styles';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

// components
import NotAuthorized from '../NotAuthorized';
import CardList from '../../components/CDS/CardList';

// abi
import { cdsAbi } from '../../utils/abi/cds';

type MyPageProps = {
  web3: Web3 | null;
  cdsLounge: Contract | null;
};

export interface ICardProps {
  address: string;
  isBuyer: boolean;
  status: string;
  asset: string;
  claimPrice: number;
}

const MyPage: React.FC<MyPageProps> = ({ web3, cdsLounge }: MyPageProps) => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);
  const [loading, setLoading] = useState<boolean>(true);
  const [ownedCDS, setOwnedCDS] = useState<string[]>([]);

  const [contractDetails, setContractDetails] = useState<ICardProps[]>([]);
  const [filter, setFilter] = useState({
    isBuyer: true,
    asset: 'BTC',
    status: 'active',
  });
  const [filteredContracts, setFilteredContracts] = useState<ICardProps[]>([]);

  const status = ['inactive', 'pending', 'active', 'claimed', 'expired'];
  const assetType = ['BTC', 'ETH', 'LINK'];

  const getOwenedCDS = async () => {
    try {
      if (cdsLounge && web3) {
        const res = await cdsLounge.methods
          .getOwnedCDS(wallet.address) // to change
          .call({ from: wallet.address });
        setOwnedCDS(res);

        const contracts: ICardProps[] = [];
        for (let i = 0; i < res.length; i++) {
          const cds = new web3.eth.Contract(cdsAbi as AbiItem[], res[i]);
          const buyer = await cds.methods
            .getBuyer()
            .call({ from: wallet.address });
          const statusIdx = await cds.methods
            .status()
            .call({ from: wallet.address });
          const assetTypeIdx = await cds.methods
            .assetType()
            .call({ from: wallet.address });
          const claimPrice = await cds.methods
            .claimPrice()
            .call({ from: wallet.address });

          const detail = {
            address: res[i],
            isBuyer: buyer.toLowerCase() === wallet.address,
            status: status[statusIdx],
            asset: assetType[assetTypeIdx],
            claimPrice: +claimPrice,
          };
          setContractDetails((prev) => {
            return prev.concat(detail);
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFilteredCDS = () => {
    const filtered = contractDetails
      .filter((contract) => {
        if (filter.isBuyer === undefined) {
          return true;
        }
        return filter.isBuyer === contract.isBuyer;
      })
      .filter((contract) => {
        if (filter.asset === undefined) {
          return true;
        }
        return filter.asset === contract.asset;
      })
      .filter((contract) => {
        if (filter.status === undefined) {
          return true;
        }
        return filter.status === contract.status;
      });
    setFilteredContracts(filtered);
    setLoading(false);
  };

  const handlePosition = (e: RadioChangeEvent) => {
    setFilter((prev) => {
      return { ...prev, isBuyer: e.target.value };
    });
  };

  const handleAsset = (e: RadioChangeEvent) => {
    setFilter((prev) => {
      return { ...prev, asset: e.target.value };
    });
  };

  const handleStatus = (e: RadioChangeEvent) => {
    setFilter((prev) => {
      return { ...prev, status: e.target.value };
    });
  };

  useEffect(() => {
    getOwenedCDS();
    getFilteredCDS();
  }, []);

  useEffect(() => {
    getFilteredCDS();
  }, [filter]);

  return (
    <Row justify="center" align="middle" gutter={{ md: 24 }}>
      <Col md={24}>
        {!wallet.isLinked ? (
          <NotAuthorized />
        ) : (
          <>
            <Avatar
              shape="square"
              size={{ xs: 70, sm: 110, md: 150, lg: 220, xl: 300, xxl: 400 }}
              icon={<UserOutlined />}
            />
            <Profile>
              <span>
                <strong>{wallet.address}</strong>
              </span>
            </Profile>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group value={filter.isBuyer} onChange={handlePosition}>
                <Radio.Button>All</Radio.Button>
                <Radio.Button value={true}>Buyer</Radio.Button>
                <Radio.Button value={false}>Seller</Radio.Button>
              </Radio.Group>

              <Radio.Group value={filter.asset} onChange={handleAsset}>
                <Radio.Button>All</Radio.Button>
                <Radio.Button value="BTC">BTC</Radio.Button>
                <Radio.Button value="ETH">ETH</Radio.Button>
                <Radio.Button value="LINK">LINK</Radio.Button>
              </Radio.Group>

              <Radio.Group
                name="status"
                value={filter.status}
                onChange={handleStatus}
              >
                <Radio.Button>All</Radio.Button>
                <Radio.Button value="inactive">Inactive</Radio.Button>
                <Radio.Button value="pending">Pending</Radio.Button>
                <Radio.Button value="active">Acitve</Radio.Button>
                <Radio.Button value="claimed">Claimed</Radio.Button>
                <Radio.Button value="expired">Expired</Radio.Button>
              </Radio.Group>
            </Space>

            <br />
            <br />
            <br />
            {loading ? (
              <Loading />
            ) : (
              <Space>
                {filteredContracts.length > 0 ? (
                  <CardList contracts={filteredContracts} />
                ) : (
                  <NoResult />
                )}
              </Space>
            )}
          </>
        )}
      </Col>
    </Row>
  );
};

const NoResult: React.FC = () => {
  return <div>No result</div>;
};

const Loading: React.FC = () => {
  return <div>Loading</div>;
};

const Profile = styled.p`
  font-size: ${styles.fs_8};
  padding: 20px;
`;

export default MyPage;
