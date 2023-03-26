// modules
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract, EventData } from 'web3-eth-contract';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

// abi
import { cdsLoungeAbi, cdsLoungeAddress } from '../../assets/abi/cdsLounge';

type WalletProps = {
  wallet: IWalletTypes;
};

// App 에서 web3 만들어서 recoilSet하기 + cdsLounge

export default class CDSLounge {
  private static instance: CDSLounge;
  private contract: Contract = new Contract([], '');
  private web3: Web3;
  private web3Endpoint: string;

  private constructor(webSocketURI: string) {
    this.web3 = new Web3(webSocketURI);
    this.web3Endpoint = webSocketURI;
  }

  public static getInstance(webSocketURI: string) {
    if (!CDSLounge.instance) {
      CDSLounge.instance = new CDSLounge(webSocketURI);
    } else {
      CDSLounge.instance.web3 = new Web3(webSocketURI);
    }
    return CDSLounge.instance;
  }

  public async setContract(abi: any, address: string) {
    this.contract = new this.web3.eth.Contract(abi, address);

    const ContractName = await this.contract.events;
    if (ContractName.length === 0) {
      throw new Error('Invalid Contract');
    }
    return this.contract;
  }
}

/*
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
};

*/
