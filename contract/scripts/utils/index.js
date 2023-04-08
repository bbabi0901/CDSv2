const hre = require('hardhat');
const fs = require('fs');

require('dotenv').config();

const CA_PATH = '../contract/CONTRACT_ADDRESS.json';

module.exports = {
  writeAddress: (contract, address) => {
    let addresses = {};
    try {
      const jsonString = fs.readFileSync(CA_PATH, {
        encoding: 'utf-8',
        flag: 'r',
      });
      addresses = JSON.parse(jsonString);
      addresses[contract] = address;
    } catch (error) {
      addresses[contract] = address;
    }
    const jsonString = JSON.stringify(addresses);
    try {
      fs.writeFileSync(CA_PATH, jsonString);
    } catch (error) {
      console.log(error);
    }
  },
  readAddress: (contract) => {
    try {
      const jsonString = fs.readFileSync(CA_PATH, {
        encoding: 'utf-8',
        flag: 'r',
      });
      const contractAddresses = JSON.parse(jsonString);
      if (Object.keys(contractAddresses).includes(contract)) {
        return contractAddresses[contract];
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  getAccount: () => {},
  defaultState: {
    BTC: {
      initAssetPrice: 25000,
      claimPrice: 21250,
      liquidationPrice: 20000,
      sellerDeposit: 50000,
      premium: 750,
      buyerDeposit: 3000,
      assetType: 0,
    },
    ETH: {
      initAssetPrice: 1600,
      claimPrice: 1400,
      liquidationPrice: 1200,
      sellerDeposit: 4000,
      premium: 40,
      buyerDeposit: 160,
      assetType: 1,
    },
    LINK: {
      initAssetPrice: 8,
      laimPrice: 6,
      iquidationPrice: 5,
      ellerDeposit: 3000,
      remium: 40,
      uyerDeposit: 160,
      ssetType: 2,
    },
    faucet: 10000000,
    rounds: 12,
  },
};
