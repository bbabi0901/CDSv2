// modules
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

// components
import NotAuthorized from '../NotAuthorized';
import CDSCard from '../../components/CDS/CDSCard';

type MyPageProps = {
  cdsLounge: Contract | null;
};
const MyPage: React.FC<MyPageProps> = ({ cdsLounge }: MyPageProps) => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);
  console.log('wallet link', wallet.isLinked);

  const [ownedCDS, setOwnedCDS] = useState<string[]>([]);

  const getOwenedCDS = async () => {
    if (cdsLounge) {
      const res = await cdsLounge.methods
        .getOwnedCDS(wallet.address) // to change
        .call({ from: wallet.address });
      console.log('result:', res);
      setOwnedCDS(res);
    } else {
      console.log('loading', cdsLounge);
    }
  };

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
              {ownedCDS.length !== 0
                ? ownedCDS.map((cds) => {
                    return (
                      <li key={cds}>
                        <CDSCard contractAddress={cds} />
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
