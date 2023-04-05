const { expect } = require('chai');
const { ethers } = require('hardhat');

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const { INIT_PRICE, EVENT_TYPES, decodeEvent } = require('./utils');

const DEFAULT_CREAT_INPUT = {
  HostSetting: true,
  InitAssetPrice: 25000,
  ClaimPrice: 21250,
  LiquidationPrice: 20000,
  SellerDeposit: 50000,
  Premium: 750,
  PremiumRounds: 12, // total lifecycle of test cds is 2hrs
  BuyerDeposit: this.Premium * (3 + 1),
  AssetType: 0, // BTC:0, ETH:1, LINK:2
};

// fusd, oracle deploy => fixture address => attach.
describe('Setter', async () => {
  const deployOracleFixture = async () => {
    const [owner] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory('PriceOracleMock');
    const oracle = await Oracle.deploy();
    await oracle.deployed();

    return { oracle, owner };
  };

  const deployTokenFixture = async () => {
    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('FUSD');
    const token = await Token.deploy();
    await token.deployed();

    return { token, owner };
  };

  const deployCDSLoungeFixture = async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const CDSLounge = await ethers.getContractFactory('CDSLounge');
    const cdsLounge = await CDSLounge.deploy();
    await cdsLounge.deployed();

    return { cdsLounge, owner, addr1, addr2 };
  };

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
    // const contract = this.Zombie.attach(address);

    // returns address and contract
    // return { address, dna, contract };
  };

  it('Setting Token contract', async () => {
    const { cdsLounge } = await loadFixture(deployCDSLoungeFixture);
    const { token } = await loadFixture(deployTokenFixture);

    await cdsLounge.setToken(token.address);
    const tokenContract = await cdsLounge.token();

    expect(tokenContract).to.equal(token.address);
  });

  it('Setting Oracle contract', async () => {
    // lounge
    const { cdsLounge, addr1 } = await loadFixture(deployCDSLoungeFixture);
    const { oracle } = await loadFixture(deployOracleFixture);

    await cdsLounge.setOracle(oracle.address);
    const oracleAddress = await cdsLounge.oracle();

    expect(oracleAddress).to.equal(oracle.address);

    // cds instance
    const res = await create(cdsLounge, addr1, DEFAULT_CREAT_INPUT);
    console.log(res);
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
