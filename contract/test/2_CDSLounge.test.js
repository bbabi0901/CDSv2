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

  describe('Create', () => {
    it('should throw error when invalid input', async () => {
      await truffleAssert.fails(
        cds.create(true, 20000, 21250, 20000, 50000, -750, 60 * 10, 12, 0, {
          from: accounts[2],
        }),
      );
      await truffleAssert.fails(
        cds.create(true, 20000, 21250, 20000, 100000, 750, 60 * 10, -12, 0, {
          from: accounts[2],
        }),
      );
    });

    it('should throw error when invalid deposit approved', async () => {
      await fusd.approve(cds.address, defaultBuyerDeposit - 1, {
        from: accounts[2],
      });
      await truffleAssert.fails(
        cds.create(
          defaultHostSetting,
          defaultInitAssetPrice,
          defaultClaimPrice,
          defaultLiquidationPrice,
          defaultSellerDeposit,
          defaultPremium,
          defaultPremiumRounds,
          defaultAssetType,
          { from: accounts[2] },
        ),
      );

      await fusd.approve(cds.address, defaultBuyerDeposit, {
        from: accounts[1],
      });
      await truffleAssert.fails(
        cds.create(
          !defaultHostSetting,
          defaultInitAssetPrice,
          defaultClaimPrice,
          defaultLiquidationPrice,
          defaultSellerDeposit,
          defaultPremium,
          defaultPremiumRounds,
          defaultAssetType,
          { from: accounts[1] },
        ),
      );
    });

    it('should be able to create CDS as BUYER when valid input approved and check it from mapping', async () => {
      await fusd.approve(cds.address, defaultBuyerDeposit, {
        from: accounts[2],
      });
      await truffleAssert.passes(
        await cds.create(
          defaultHostSetting,
          defaultInitAssetPrice,
          defaultClaimPrice,
          defaultLiquidationPrice,
          defaultSellerDeposit,
          defaultPremium,
          defaultPremiumRounds,
          defaultAssetType,
          { from: accounts[2] },
        ),
      );
      const [currentCDSId] = await cds.getCDSId();
      const buyer = await cds.getBuyer(currentCDSId);
      const seller = await cds.getSeller(currentCDSId);
      const buyerDepositDetail = await cds.deposits(currentCDSId, 0);
      const sellerDepositDetail = await cds.deposits(currentCDSId, 1);

      const cdsAddr = await cds.getCDS(currentCDSId);
      const targetCDS = await Contract.at(cdsAddr);

      const totalRounds = await targetCDS.rounds();
      const CDSPrices = await targetCDS.getPrices();

      const [
        initAssetPrice,
        claimPrice,
        liquidationPrice,
        premium,
        sellerDeposit,
      ] = CDSPrices;

      await assert.strictEqual(defaultInitAssetPrice, +initAssetPrice);
      await assert.strictEqual(defaultClaimPrice, +claimPrice);
      await assert.strictEqual(defaultLiquidationPrice, +liquidationPrice);
      await assert.strictEqual(defaultSellerDeposit, +sellerDeposit);
      await assert.strictEqual(defaultPremium, +premium);

      await assert.strictEqual(buyer, accounts[2]);
      await assert.strictEqual(+buyerDepositDetail, defaultBuyerDeposit);

      await assert.strictEqual(
        seller,
        '0x0000000000000000000000000000000000000000',
      );
      await assert.strictEqual(+sellerDepositDetail, 0);

      await assert.strictEqual(defaultPremiumRounds, +totalRounds);
    });

    it('should be able to create CDS as SELLER when valid input provided and check it from mapping', async () => {
      await fusd.approve(cds.address, defaultSellerDeposit, {
        from: accounts[1],
      });
      await truffleAssert.passes(
        cds.create(
          !defaultHostSetting,
          defaultInitAssetPrice,
          defaultClaimPrice,
          defaultLiquidationPrice,
          defaultSellerDeposit,
          defaultPremium,
          defaultPremiumRounds,
          defaultAssetType,
          { from: accounts[1] },
        ),
      );
      const [currentCDSId] = await cds.getCDSId();
      const buyer = await cds.getBuyer(currentCDSId);
      const seller = await cds.getSeller(currentCDSId);
      const buyerDepositDetail = await cds.deposits(currentCDSId, 0);
      const sellerDepositDetail = await cds.deposits(currentCDSId, 1);

      const cdsAddr = await cds.getCDS(currentCDSId);
      const targetCDS = await Contract.at(cdsAddr);

      const totalRounds = await targetCDS.rounds();
      const CDSPrices = await targetCDS.getPrices();
      const [
        initAssetPrice,
        claimPrice,
        liquidationPrice,
        premium,
        sellerDeposit,
      ] = CDSPrices;

      await assert.strictEqual(defaultInitAssetPrice, +initAssetPrice);
      await assert.strictEqual(defaultClaimPrice, +claimPrice);
      await assert.strictEqual(defaultLiquidationPrice, +liquidationPrice);
      await assert.strictEqual(defaultSellerDeposit, +sellerDeposit);
      await assert.strictEqual(defaultPremium, +premium);

      await assert.strictEqual(seller, accounts[1]);
      await assert.strictEqual(+sellerDepositDetail, defaultSellerDeposit);
      await assert.strictEqual(
        buyer,
        '0x0000000000000000000000000000000000000000',
      );
      await assert.strictEqual(+buyerDepositDetail, 0);

      await assert.strictEqual(defaultPremiumRounds, +totalRounds);
    });

    it('should have decreased TOKEN amount of buyer after creating CDS as BUYER', async () => {
      const before = await fusd.balanceOf(accounts[2]);
      const beforeCA = await fusd.balanceOf(cds.address);
      await fusd.approve(cds.address, defaultBuyerDeposit, {
        from: accounts[2],
      });
      await cds.create(
        defaultHostSetting,
        defaultInitAssetPrice,
        defaultClaimPrice,
        defaultLiquidationPrice,
        defaultSellerDeposit,
        defaultPremium,
        defaultPremiumRounds,
        defaultAssetType,
        { from: accounts[2] },
      );
      const after = await fusd.balanceOf(accounts[2]);
      const afterCA = await fusd.balanceOf(cds.address);

      assert.isBelow(
        +after,
        +before,
        'After Balance should be lower than Before',
      );
      assert.equal(
        +before,
        +after + defaultBuyerDeposit,
        'Sum of gas cost, msg.value, after balance should be equal to Before Balance',
      );
      await assert.strictEqual(+beforeCA + defaultBuyerDeposit, +afterCA);
    });

    it('should have decreased TOKEN amount of seller after creating CDS as SELLER', async () => {
      const before = await fusd.balanceOf(accounts[1]);
      const beforeCA = await fusd.balanceOf(cds.address);
      await fusd.approve(cds.address, defaultSellerDeposit, {
        from: accounts[1],
      });
      await cds.create(
        !defaultHostSetting,
        defaultInitAssetPrice,
        defaultClaimPrice,
        defaultLiquidationPrice,
        defaultSellerDeposit,
        defaultPremium,
        defaultPremiumRounds,
        defaultAssetType,
        { from: accounts[1] },
      );
      const after = await fusd.balanceOf(accounts[1]);
      const afterCA = await fusd.balanceOf(cds.address);

      assert.isBelow(
        +after,
        +before,
        'After Balance should be lower than Before',
      );
      assert.equal(
        +before,
        +after + defaultSellerDeposit,
        'Sum of gas cost, msg.value, after balance should be equal to Before Balance',
      );
      await assert.strictEqual(+beforeCA + defaultSellerDeposit, +afterCA);
    });
  });
});
