// modules
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

// components
import NotAuthorized from '../NotAuthorized';

// abi
import { cdsLoungeAbi, cdsLoungeAddress } from '../../assets/abi/cdsLounge';

import { cdsAbi } from '../../assets/abi/cds';

type Props = {
  contractAddress: string;
};
const CDSCard: React.FC<Props> = ({ contractAddress }) => {
  const web3 = new Web3(Web3.givenProvider || 'https://localhost:8545');
  const getDetail = async () => {
    const cdsContract = new web3.eth.Contract(
      cdsAbi as AbiItem[],
      contractAddress,
    );
    const res = await cdsContract.methods
      .getPrices()
      .call({ from: '0xFEFE9A0ff55002c89F084768E9310497beF6ddB1' }); // to change

    console.log('price :', res);
  };

  useEffect(() => {
    getDetail();
  });

  return <div>{contractAddress}</div>;
};

type WalletProps = {
  wallet: IWalletTypes;
};
const Authorized: React.FC<WalletProps> = ({ wallet }) => {
  const [ownedCDS, setOwnedCDS] = useState<string[]>([]);
  const web3 = new Web3(Web3.givenProvider || 'https://localhost:8545');

  const getOwenedCDS = async () => {
    const cdsLounge = new web3.eth.Contract(
      cdsLoungeAbi as AbiItem[],
      cdsLoungeAddress,
    );

    const res = await cdsLounge.methods
      .getOwnedCDS('0xFEFE9A0ff55002c89F084768E9310497beF6ddB1') // to change
      .call({ from: wallet.address });
    console.log('result:', res);
    setOwnedCDS(res);
  };

  useEffect(() => {
    getOwenedCDS();
  }, []);

  return (
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
  );
};

const MyPage = () => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);
  console.log('wallet link', wallet.isLinked);

  return (
    <div>
      <div>MyPage</div>
      {wallet.isLinked ? <Authorized wallet={wallet} /> : <NotAuthorized />}
    </div>
  );
};

export default MyPage;
