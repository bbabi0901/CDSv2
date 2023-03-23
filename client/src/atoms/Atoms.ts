import { atom } from 'recoil';

const walletState = atom({
  key: 'walletState',
  default: {
    address: '',
    isLinked: false,
  },
});

const focusNavState = atom({
  key: 'focusNavState',
  default: '',
});

export { walletState, focusNavState };
