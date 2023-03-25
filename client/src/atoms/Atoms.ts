import { atom } from 'recoil';

export interface IWalletTypes {
  address: string;
  network: string;
  isLinked: boolean;
}

const walletState = atom({
  key: 'walletState',
  default: {
    address: '',
    network: '',
    isLinked: false,
  },
});

const collapsedState = atom({
  key: 'collapsedState',
  default: true,
});

export { walletState, collapsedState };
