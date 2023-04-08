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
    BTC: {},
    ETH: {},
    LINK: {},
    faucet: 10000000,
  },
};
