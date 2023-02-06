/* eslint-disable node/no-unsupported-features/es-builtins */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const Web3 = require('web3');
const _ = require('lodash');

const {
  GETH_HOST,
  GETH_PORT,
  CDS_CA,
  ORACLE_CA,
  KANG_PK,
  KIM_PK,
  SEOL_PK,
  HONG_PK,
} = process.env;

// const web3 = new Web3(`http://${GETH_HOST}:${GETH_PORT}`);
const web3 = new Web3(`ws://192.168.0.100:8556`); // using local network

const OracleABI = require('../build/contracts/PriceOracleMock.json');
const CDSABI = require('../build/contracts/CDS.json');

const kangAccount = web3.eth.accounts.privateKeyToAccount(KANG_PK);
const kimAccount = web3.eth.accounts.privateKeyToAccount(KIM_PK);
const seolAccount = web3.eth.accounts.privateKeyToAccount(SEOL_PK);
const hongAccount = web3.eth.accounts.privateKeyToAccount(HONG_PK);
const addresses = [
  kangAccount.address,
  kimAccount.address,
  seolAccount.address,
  hongAccount.address,
];

// **isBuyer**: true

// **initialPriceOfAssets**: 25000

// amountOfAssets: 10

// **claimPrice**: 21250

// **liquidationPrice**: 20000

// **premium**: 750

// **premiumInterval**: 4 weeks (test 5min ~ 10min)

// TotalPremiumRounds: 6

// **sellerDeposit**: 50000

const defaultHostSetting = true; // isBuyer
const defaultInitAssetPrice = 100;
const defaultClaimPrice = 80;
const defaultLiquidationPrice = 60;
const defaultSellerDeposit = 400;
const defaultPremium = 4;
const defaultPremiumInterval = 60 * 10; // 10 minutes
const defaultPremiumRounds = 12; // total lifecycle of test cds is 2hrs
const defaultBuyerDeposit = defaultPremium * 3;

// create contract objects
const priceOracleMock = new web3.eth.Contract(OracleABI.abi, ORACLE_CA);
const cds = new web3.eth.Contract(CDSABI.abi, CDS_CA);
(async () => {
  await cds.methods.setOracle(ORACLE_CA).send({
    from: addresses[0],
  });
})();
// set priceoracle berfore init

// 전체 시나리오는 비동기로 수행한다.
// 시나리오 별로는 동기적으로 수행해야한다.
async function createSwap(buyer, seller, isBuyer) {
  const result = await cds.methods
    .createSwap(
      isBuyer,
      defaultInitAssetPrice,
      defaultClaimPrice,
      defaultLiquidationPrice,
      defaultSellerDeposit,
      defaultPremium,
      defaultPremiumInterval,
      defaultPremiumRounds,
    )
    .send({
      from: isBuyer ? buyer : seller,
      value: isBuyer ? defaultBuyerDeposit : defaultSellerDeposit,
    });
  const { returnValues } = result.events.CreateSwap;
  const { swapId } = returnValues;
  console.log(`Create Swap : ${swapId}`);
  return returnValues;
}

async function cancelSwap(buyer, seller, isBuyer, swapId) {
  const result = await cds.methods.cancelSwap(swapId).send({
    from: isBuyer ? buyer : seller,
  });
  console.log(`Create Swap : ${swapId}`);
  const { returnValues } = result.events.CancelSwap;
  return returnValues;
}

async function acceptSwap(buyer, seller, isBuyer, swapId) {
  const result = await cds.methods
    .acceptSwap(defaultInitAssetPrice, swapId)
    .send({
      from: isBuyer ? seller : buyer,
      value: isBuyer ? defaultSellerDeposit : defaultBuyerDeposit,
    });
  console.log(`Accept Swap : ${swapId}`);
  const { returnValues } = result.events.AcceptSwap;
  return returnValues;
}

async function closeSwap(buyer, swapId) {
  const result = await cds.methods.closeSwap(swapId).send({
    from: buyer,
  });
  console.log(`Close Swap : ${swapId}`);
  const { returnValues } = result.events.CloseSwap;
  return returnValues;
}

async function claimSwap(buyer, swapId) {
  const result = await cds.methods.claimSwap(swapId).send({
    from: buyer,
  });
  console.log(`Claim Swap : ${swapId}`);
  const { returnValues } = result.events.ClaimSwap;
  return returnValues;
}

async function payPremium(buyer, swapId) {
  const result = await cds.methods.payPremium(swapId).send({
    from: buyer,
    value: defaultPremium,
  });
  console.log(`PayPremium : ${swapId}`);
  const { returnValues } = result.events.PayPremium;
  return returnValues;
}

async function createPending() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    [buyer, seller] = _.sampleSize(addresses, 2);
    await createSwap(buyer, seller, isBuyer);
  } catch (err) {
    console.error(err);
  }
}
async function createCancel() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    const [buyer, seller] = _.sampleSize(addresses, 2);
    const { swapId } = await createSwap(buyer, seller, isBuyer);
    await cancelSwap(buyer, seller, isBuyer, swapId);
  } catch (err) {
    console.error(err);
  }
}

async function createAccept() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    const [buyer, seller] = _.sampleSize(addresses, 2);
    const returnValues = await createSwap(buyer, seller, isBuyer);
    const { swapId } = returnValues;
    await acceptSwap(buyer, seller, isBuyer, swapId);
  } catch (err) {
    console.error(err);
  }
}

async function createAcceptClose() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    const [buyer, seller] = _.sampleSize(addresses, 2);

    const returnValues = await createSwap(buyer, seller, isBuyer);
    const { swapId } = returnValues;
    await acceptSwap(buyer, seller, isBuyer, swapId);
    await closeSwap(buyer, swapId);
  } catch (err) {
    console.error(err);
  }
}

async function createAcceptClaim() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    const [buyer, seller] = _.sampleSize(addresses, 2);

    const returnValues = await createSwap(buyer, seller, isBuyer);
    const { swapId } = returnValues;
    await acceptSwap(buyer, seller, isBuyer, swapId);
    await priceOracleMock.methods
      .setPrice(defaultClaimPrice - 1)
      .send({ from: buyer });
    await claimSwap(buyer, swapId);
    // price oracle roll back
    await priceOracleMock.methods.setPrice(20000).send({ from: buyer });
    // claimSwap();
  } catch (err) {
    console.error(err);
  }
}

async function createAcceptLiquidate() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    const [buyer, seller] = _.sampleSize(addresses, 2);

    const returnValues = await createSwap(buyer, seller, isBuyer);
    const { swapId } = returnValues;
    await acceptSwap(buyer, seller, isBuyer, swapId);
    await priceOracleMock.methods
      .setPrice(defaultLiquidationPrice - 1)
      .send({ from: buyer });
    await claimSwap(buyer, swapId);
    // price oracle roll back
    await priceOracleMock.methods.setPrice(20000).send({ from: buyer });
  } catch (err) {
    console.error(err);
  }
}

async function createAcceptPay() {
  try {
    const currentSecond = new Date().getMilliseconds();
    const isBuyer = currentSecond % 2 === 0;
    const [buyer, seller] = _.sampleSize(addresses, 2);

    const returnValues = await createSwap(buyer, seller, isBuyer);
    const { swapId } = returnValues;
    await acceptSwap(buyer, seller, isBuyer, swapId);
    await payPremium(buyer, swapId);
  } catch (err) {
    console.error(err);
  }
}

let count = 0;
const totalSwaps = 5;
while (count < totalSwaps) {
  // const random = _.random(0, 99);
  // if (random < 5) {
  //   createAcceptClose(); // 5%
  // } else if (random < 10) {
  //   createAcceptLiquidate(); // 5%
  // } else if (random < 20) {
  //   createCancel(); // 10%
  // } else if (random < 30) {
  //   createAccept(); // 10%
  // } else if (random < 50) {
  //   createPending(); // 20%
  // } else if (random < 70) {
  //   createAcceptClaim(); // 20%
  // } else if (random < 100) {
  //   createAcceptPay(); // 30%
  // }
  // createAcceptClose(); // 5%
  // createAcceptLiquidate(); // 5%
  // createCancel(); // 10%
  // createAccept(); // 10%
  // createPending(); // 20%
  // createAcceptClaim(); // 20%
  createAcceptPay(); // 30%
  count++;
}
