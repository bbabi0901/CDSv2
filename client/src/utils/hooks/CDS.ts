// modules
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

// abi
import { cdsAbi } from '../../assets/abi/cds';

export default class CDS {
  private static instance: CDS;
  private contract: Contract = new Contract([], '');
  private web3: Web3;
  private address: string;
  private caller: string;

  private constructor(address: string, caller: string) {
    this.address = address;
    this.caller = caller;
    this.web3 = new Web3(Web3.givenProvider || 'https://localhost:8545');
    this.contract = new this.web3.eth.Contract(cdsAbi as AbiItem[], address);
  }

  public static getInstance(address: string, caller: string) {
    if (!CDS.instance) {
      CDS.instance = new CDS(address, caller);
    } else {
      CDS.instance.address = address;
      CDS.instance.caller = caller;
    }
    return CDS.instance;
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

  public getDetails() {
    const res = {
      buyer: this.getBuyer(),
      seller: this.getSeller(),
      assetType: this.getAssetType(),
      amount: this.getAmountOfAsset(),
      prices: this.getPrices(),
      reward: this.getReward(),
      payDate: this.getNextPayDate(),
      rounds: this.getRounds(),
      totalRounds: this.getTotalRounds(),
      status: this.getStatus(),
    };

    return res;
  }
}
