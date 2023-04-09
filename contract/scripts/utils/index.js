const hre = require('hardhat');
const fs = require('fs');

require('dotenv').config();

const CA_PATH = '../contract/CONTRACT_ADDRESS.json';
const defaultState = {
  BTC: {
    InitAssetPrice: 25000,
    ClaimPrice: 21250,
    LiquidationPrice: 20000,
    SellerDeposit: 50000,
    Premium: 750,
    PremiumRounds: 12,
    BuyerDeposit: 3000,
    AssetType: 0,
  },
  ETH: {
    InitAssetPrice: 1600,
    ClaimPrice: 1400,
    LiquidationPrice: 1200,
    SellerDeposit: 4000,
    Premium: 40,
    PremiumRounds: 12,
    BuyerDeposit: 160,
    AssetType: 1,
  },
  LINK: {
    InitAssetPrice: 8,
    ClaimPrice: 6,
    LiquidationPrice: 5,
    SellerDeposit: 3000,
    Premium: 40,
    PremiumRounds: 12,
    BuyerDeposit: 160,
    AssetType: 2,
  },
  faucet: 10000000,
};

const readAddress = (contract) => {
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
};

const writeAddress = (contract, address) => {
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
};

module.exports = {
  writeAddress,
  readAddress,
  defaultState,
};
