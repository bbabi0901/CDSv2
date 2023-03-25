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

const focusNavState = atom({
  key: 'focusNavState',
  default: '',
});

export { walletState, focusNavState };
