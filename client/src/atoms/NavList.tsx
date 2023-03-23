import { atom } from 'recoil';

export interface AssetTypes {
  type: number;
  isPending: boolean;
}

export const inputState = atom<string>({
  key: 'inputState',
  default: '',
});

export const assetTypeState = atom<AssetTypes[]>({
  key: 'todos',
  default: [
    {
      type: 0,
      isPending: true,
    },

    {
      type: 1,
      isPending: true,
    },

    {
      type: 2,
      isPending: true,
    },
  ],
});
