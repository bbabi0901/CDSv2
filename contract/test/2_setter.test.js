const { expect } = require('chai');
const { ethers } = require('hardhat');

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const { INIT_PRICE, EVENT_TYPES, decode } = require('./utils');

const DEFAULT_CREAT_INPUT = {
  HostSetting: true,
  InitAssetPrice: 25000,
  ClaimPrice: 21250,
  LiquidationPrice: 20000,
  SellerDeposit: 50000,
  Premium: 750,
  PremiumRounds: 12, // total lifecycle of test cds is 2hrs
  BuyerDeposit: 3000,
  AssetType: 0, // BTC:0, ETH:1, LINK:2
};
const DEFAULT_FAUCET = 1000000;

const deployOracle = async () => {
  const Oracle = await ethers.getContractFactory('PriceOracleMock');
  const oracle = await Oracle.deploy();
  await oracle.deployed();

  return oracle;
};

const deployToken = async () => {
  const Token = await ethers.getContractFactory('FUSD');
  const token = await Token.deploy();
  await token.deployed();

  return token;
};

const deployCDSLounge = async () => {
  const CDSLounge = await ethers.getContractFactory('CDSLounge');
  const cdsLounge = await CDSLounge.deploy();
  await cdsLounge.deployed();

  return cdsLounge;
};

describe('CDS Lounge', async () => {
  /*
  const create = async (contract, address, data) => {
    const tx = await contract
      .connect(address)
      .create(
        data.HostSetting,
        data.InitAssetPrice,
        data.ClaimPrice,
        data.LiquidationPrice,
        data.SellerDeposit,
        data.Premium,
        data.PremiumRounds,
        data.AssetType,
      );

    const receipt = await tx.wait();

    let res = decodeEvent(EVENT_TYPES.CREATE, receipt);

    return res;
    // dna = +dna;
    // const contract = Zombie.attach(address);

    // returns address and contract
    // return { address, dna, contract };
  };
  */

  // accounts
  let admin, buyer, seller;
  // contracts
  let oracle, token, cdsLounge, CDS;

  // set accounts balance, deploy contracts
  before(async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    admin = owner;
    buyer = addr1;
    seller = addr2;

    console.log(`
    Accounts
    -----------------------------------------------------------
    Admin  Addr : ${admin.address}
    Buyer  Addr : ${buyer.address}
    Seller Addr : ${seller.address}
    `);

    oracle = await deployOracle();
    token = await deployToken();
    cdsLounge = await deployCDSLounge();

    console.log(`
    Contracts
    -----------------------------------------------------------
    Oracle      : ${oracle.address}
    Token       : ${token.address}
    CDS Lounge  : ${cdsLounge.address}
    `);

    await token.transfer(buyer.address, DEFAULT_FAUCET);
    await token.transfer(seller.address, DEFAULT_FAUCET);

    // 주소 넣어야 하면 account object에서 address만
    // msg.sender를 바꿔야하면 connect(account object)
    // ex) await token.connect(buyer).transfer(seller.address, DEFAULT_FAUCET / 10);

    CDS = await ethers.getContractFactory('CDS');
  });

  describe('Initial Settings Test', async () => {
    it('Faucet check', async () => {
      let bal = await token.balanceOf(buyer.address);
      expect(+bal).to.equal(DEFAULT_FAUCET);

      bal = await token.balanceOf(seller.address);
      expect(+bal).to.equal(DEFAULT_FAUCET);
    });

    it('Setting Token contract', async () => {
      await cdsLounge.setToken(token.address);
      const tokenContract = await cdsLounge.token();

      expect(tokenContract).to.equal(token.address);
    });

    it('Setting Oracle contract', async () => {
      // checking oracle of cds lounge
      await cdsLounge.setOracle(oracle.address);
      const oracleAddress = await cdsLounge.oracle();

      expect(oracleAddress).to.equal(oracle.address);

      // cds instance
      // set Token 안하면 Error: Transaction reverted: function returned an unexpected amount of data 발생
      await cdsLounge.setToken(token.address);

      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_CREAT_INPUT.BuyerDeposit);

      const tx = await cdsLounge
        .connect(buyer)
        .create(
          DEFAULT_CREAT_INPUT.HostSetting,
          DEFAULT_CREAT_INPUT.InitAssetPrice,
          DEFAULT_CREAT_INPUT.ClaimPrice,
          DEFAULT_CREAT_INPUT.LiquidationPrice,
          DEFAULT_CREAT_INPUT.SellerDeposit,
          DEFAULT_CREAT_INPUT.Premium,
          DEFAULT_CREAT_INPUT.PremiumRounds,
          DEFAULT_CREAT_INPUT.AssetType,
        );

      const receipt = await tx.wait();

      const { swap: cdsAddr } = receipt.events[3].args;
      const cds = CDS.attach(cdsAddr);

      const oracleAddr = await cds.priceOracle();
      expect(oracleAddr).to.equal(oracle.address);
    });
  });

  /*
  it('should throw error if priceOracle is not set', async () => {
    await assert.strictEqual(PRICE_ORACLE_ADDRESS, priceOracle.address);
  });

  it('should be able to get value from it', async () => {
    const btcPrice = 2500000000000;
    const ethPrice = 160000000000;
    const linkPrice = 750000000;

    await assert.strictEqual(btcPrice, +(await priceOracle.btcPrice()));
    await assert.strictEqual(ethPrice, +(await priceOracle.ethPrice()));
    await assert.strictEqual(linkPrice, +(await priceOracle.linkPrice()));
  });

  it('should be able to set value and check if changed properly', async () => {
    const defaultBTCPrice = 2500000000000;
    const defaultETHPrice = 160000000000;
    const defaultLinkPrice = 750000000;

    const changeBTCPrice = 2200000000000;
    const changeETHPrice = 200000000000;
    const changeLinkPrice = 600000000;

    await truffleAssert.passes(
      await priceOracle.setBTCPrice(changeBTCPrice, { from: accounts[0] }),
      await priceOracle.setETHPrice(changeETHPrice, { from: accounts[0] }),
      await priceOracle.setLinkPrice(changeLinkPrice, { from: accounts[0] }),
    );

    await assert.strictEqual(changeBTCPrice, +(await priceOracle.btcPrice()));
    await assert.strictEqual(changeETHPrice, +(await priceOracle.ethPrice()));
    await assert.strictEqual(changeLinkPrice, +(await priceOracle.linkPrice()));

    await truffleAssert.passes(
      await priceOracle.setBTCPrice(defaultBTCPrice),
      await priceOracle.setETHPrice(defaultETHPrice),
      await priceOracle.setLinkPrice(defaultLinkPrice),
    );
  });
  */
});
