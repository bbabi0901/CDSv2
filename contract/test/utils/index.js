const { ethers } = require('hardhat');

module.exports = {
  INIT_PRICE: {
    BTC: 2500000000000,
    ETH: 160000000000,
    LINK: 750000000,
  },

  REVERT: {
    INSUFFICIENT_ALLOWANCE: 'ERC20: insufficient allowance',
    INVALID_ASSET_TYPE: 'BTC:0, ETH:1, LINK:2',
    UNAUTHORIZED_SELLER: 'Unauthorized address',
    UNAUTHORIZED_PARTICIPANTS: 'Only buyer/seller of the CDS can call',
    UNAUTHORIZED_BUYER: 'Only buyer of the CDS can call',
    NOT_PENDING: 'The status of the CDS should be pending',
    NOT_ACTIVE: 'The status of the CDS should be active',
  },

  hash: (data) => {
    return ethers.utils.keccak256(data);
  },

  encode: (dataTypes, data) => {
    return ethers.utils.defaultAbiCoder.encode(dataTypes, data);
  },

  decode: (types, data) => {
    return ethers.utils.defaultAbiCoder.decode(types, data);
  },
};
