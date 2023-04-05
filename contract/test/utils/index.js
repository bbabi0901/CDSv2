const { ethers } = require('hardhat');

module.exports = {
  INIT_PRICE: {
    BTC: 2500000000000,
    ETH: 160000000000,
    LINK: 750000000,
  },

  EVENT_TYPES: {
    CREATE: ['address', 'bool', 'uint256', 'uint32', 'address'],
  },

  hash: (data) => {
    return ethers.utils.keccak256(data);
  },

  encodeParams: (dataTypes, data) => {
    return ethers.utils.defaultAbiCoder.encode(dataTypes, data);
  },

  decode: (types, data) => {
    return ethers.utils.defaultAbiCoder.decode(types, data);
  },
};
