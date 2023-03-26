// modules
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

// atoms
import { IWalletTypes, walletState } from '../../atoms/Atoms';
import { cdsAbi } from '../../assets/abi/cds';

// utils
import CDS from '../../utils/hooks/CDS';

type Props = {
  contractAddress: string;
};
const CDSCard: React.FC<Props> = ({ contractAddress }) => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);
  const web3 = new Web3(Web3.givenProvider || 'https://localhost:8545');
  const getDetail = async () => {
    const cdsContract = CDS.getInstance(contractAddress, wallet.address);
    const res = await cdsContract.getPrices();
    console.log('price :', res);
  };

  useEffect(() => {
    // getDetail();
  });

  return <div>{contractAddress}</div>;
};

export default CDSCard;

/*
useCDSLounge =>
class로 하면 생성자는?
메서드는 public으로 각각 구현하면 될듯

useCDS =>
class로 하면 생성자는 contract address가 필수
여기서 메서드에서는 인자로 호출자 address는 일단 받는식으로?
아니면 caller에 이미 담아 놓는다던가.

card에는 간략한 인포만 있으면 되서 필요없고 (얘는 props로 data만 건내주고 클릭하면 search/{addredss}로 이동하도록)
아마 search 페이지에서 필요할듯 address 가지고 
useCDS(address)로 객체하나 만들어서
메서드 필요한대로 불러오는 방식으로

create, accept에서는 useCDSLounge가 필요할듯?

*/
