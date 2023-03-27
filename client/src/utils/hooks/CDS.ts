// modules
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

// abi
import { cdsAbi } from '../../assets/abi/cds';

export default class CDS {
  private contract: Contract = new Contract([], '');
  private web3: Web3;
  public address: string;
  public caller: string;

  public constructor(address: string, caller: string) {
    this.address = address;
    this.caller = caller;
    this.web3 = new Web3(Web3.givenProvider || 'https://localhost:8545');
    this.contract = new this.web3.eth.Contract(cdsAbi as AbiItem[], address);
  }

  public async getContract() {
    const ContractName = await this.contract.events;
    if (ContractName.length === 0) {
      throw new Error('Invalid Contract');
    }
    return this.contract;
  }

  public async getPrices() {
    const res = await this.contract.methods
      .getPrices()
      .call({ from: this.caller });
    console.log('fromclas', res);
    return res;
  }

  public async getAmountOfAsset() {
    const res = await this.contract.methods
      .getAmountOfAsset()
      .call({ from: this.caller });
    return res;
  }

  public async getBuyer() {
    const res = await this.contract.methods
      .getBuyer()
      .call({ from: this.caller });
    return res;
  }

  public async getSeller() {
    const res = await this.contract.methods
      .getSeller()
      .call({ from: this.caller });
    return res;
  }

  public async getReward() {
    const res = await this.contract.methods
      .getClaimReward()
      .call({ from: this.caller });
    return res;
  }

  public async getRounds() {
    const res = await this.contract.methods
      .rounds()
      .call({ from: this.caller });
    return res;
  }

  public async getTotalRounds() {
    const res = await this.contract.methods
      .totalRounds()
      .call({ from: this.caller });
    return res;
  }
  public async getNextPayDate() {
    const res = await this.contract.methods
      .nextPayDate()
      .call({ from: this.caller });
    return res;
  }

  public async getAssetType() {
    const res = await this.contract.methods
      .assetType()
      .call({ from: this.caller });
    return res;
  }

  public async getStatus() {
    const res = await this.contract.methods
      .status()
      .call({ from: this.caller });
    return res;
  }

  // public async getDetails() {
  //   const res = {
  //     buyer: await this.getBuyer(),
  //     seller: await this.getSeller(),
  //     assetType: await this.getAssetType(),
  //     amount: await this.getAmountOfAsset(),
  //     prices: await this.getPrices(),
  //     reward: await this.getReward(),
  //     payDate: await await this.getNextPayDate(),
  //     rounds: await this.getRounds(),
  //     totalRounds: await this.getTotalRounds(),
  //     status: await this.getStatus(),
  //   };

  //   return res;
  // }
}

// check webpack,
// https://velog.io/@hoo00nn/React-TypeScript-%ED%99%98%EA%B2%BD%EC%97%90%EC%84%9C-%EC%A0%88%EB%8C%80%EA%B2%BD%EB%A1%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
