let cdsLoungeAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'guestAddr',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'Accept',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'Cancel',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'claimReward',
        type: 'uint256',
      },
    ],
    name: 'Claim',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'Close',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'hostAddr',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isBuyer',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'assetType',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'swap',
        type: 'address',
      },
    ],
    name: 'Create',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'Expire',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'PayPremium',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'deposits',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'getBuyer',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'getCDS',
    outputs: [
      {
        internalType: 'contract CDS',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'getCDSId',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: '_value',
            type: 'uint256',
          },
        ],
        internalType: 'struct Counters.Counter',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getOwnedCDS',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'getSeller',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'pendingCDSs',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'isBuyer',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'initAssetPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'claimPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidationPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'sellerDeposit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'premium',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'totalRounds',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'assetType',
        type: 'uint32',
      },
    ],
    name: 'create',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_initAssetPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_cdsId',
        type: 'uint256',
      },
    ],
    name: 'accept',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'cancel',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'close',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'claim',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'expire',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'payPremium',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cdsId',
        type: 'uint256',
      },
    ],
    name: 'payPremiumByDeposit',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
let cdsLoungeAddress = '0x8DEC14C04d7e6b0709225806274b5d7843C9d64A';
export { cdsLoungeAbi, cdsLoungeAddress };
