// modules
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { Col, Row } from 'antd';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

// components
import NotAuthorized from '../NotAuthorized';
import CDSCard from '../../components/CDS/CDSCard';
import Swiper from '../../components/CDS/Swiper';

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
}

const MyPage: React.FC<MyPageProps> = ({ web3, cdsLounge }: MyPageProps) => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);

  const [ownedCDS, setOwnedCDS] = useState<string[]>([]);
  const [contracts, setContracts] = useState<ICardProps[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ICardProps[]>([]);

  const status = ['inactive', 'pending', 'active', 'claimed', 'expired'];
  const assetType = ['BTC', 'ETH', 'LINK'];

  const getOwenedCDS = async () => {
    if (cdsLounge && web3) {
      const res = await cdsLounge.methods
        .getOwnedCDS(wallet.address) // to change
        .call({ from: wallet.address });
      setOwnedCDS(res);

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
        const detail = {
          address: res[i],
          isBuyer: buyer.toLowerCase() === wallet.address,
          status: status[statusIdx],
          asset: assetType[assetTypeIdx],
        };
        setContracts((prev) => {
          return prev.concat(detail);
        });
      }
    }
  };

  // 카드 클릭하면 search/{address} 로 이동 => detail
  // cds 관련 hook 있으면 좋을듯

  useEffect(() => {
    getOwenedCDS();
  }, [wallet]);

  return (
    <Row justify="center" align="middle" gutter={{ md: 24 }}>
      <Col md={24}>
        <div>
          <div>MyPage</div>
          {wallet.isLinked ? (
            <div>
              <div>{wallet.address}</div>
              {/* <div>
                <ul>
                  {contracts.length !== 0
                    ? contracts.map((detail) => {
                        return (
                          <CDSCard key={`${detail.address}`} {...detail} />
                        );
                      })
                    : ''}
                </ul>
              </div> */}
              <Swiper contracts={contracts} />
            </div>
          ) : (
            <NotAuthorized />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default MyPage;
