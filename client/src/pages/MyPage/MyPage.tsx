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

// abi
import { cdsAbi } from '../../utils/abi/cds';

type MyPageProps = {
  web3: Web3 | null;
  cdsLounge: Contract | null;
};
type DetailProps = {
  address: string;
  prices: string[];
};
const MyPage: React.FC<MyPageProps> = ({ web3, cdsLounge }: MyPageProps) => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);

  const [ownedCDS, setOwnedCDS] = useState<string[]>([]);
  const [cdsDetails, setCdsDetails] = useState<DetailProps[]>([]);

  const getOwenedCDS = async () => {
    if (cdsLounge && web3) {
      const res = await cdsLounge.methods
        .getOwnedCDS(wallet.address) // to change
        .call({ from: wallet.address });
      setOwnedCDS(res);

      for (let i = 0; i < res.length; i++) {
        const cds = new web3.eth.Contract(cdsAbi as AbiItem[], res[i]);
        const prices = await cds.methods
          .getPrices()
          .call({ from: wallet.address });
        const detail = {
          address: res[i],
          prices: prices,
        };
        setCdsDetails((prev) => {
          return prev.concat(detail);
        });
      }
    }
  };

  // card에 또 필요한거 assetType.
  // assetType에 따라 card image 다르게
  // 카드 클릭하면 search/{address} 로 이동
  // cds 관련 hook 있으면 좋을듯

  useEffect(() => {
    getOwenedCDS();
  }, [wallet]);

  return (
    <div>
      <div>MyPage</div>
      {wallet.isLinked ? (
        <div>
          <div>{wallet.address}</div>
          <div>
            <ul>
              {cdsDetails.length !== 0
                ? cdsDetails.map((detail) => {
                    return (
                      <li key={`${detail.address}${detail.prices[0]}`}>
                        <CDSCard
                          address={detail.address}
                          prices={detail.prices}
                        />
                      </li>
                    );
                  })
                : ''}
            </ul>
          </div>
        </div>
      ) : (
        <NotAuthorized />
      )}
    </div>
  );
};

export default MyPage;
