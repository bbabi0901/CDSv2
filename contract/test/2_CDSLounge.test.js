const { expect } = require('chai');
const { ethers } = require('hardhat');

const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const { INIT_PRICE, EVENT_TYPES, REVERT, EVENT, decode } = require('./utils');

const DEFAULT_CREAT_INPUT = {
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
  // accounts
  let admin, buyer, seller, unauthorized;
  // contracts
  let oracle, token, cdsLounge, CDS;

  const create = async () => {
    await token
      .connect(buyer)
      .approve(cdsLounge.address, DEFAULT_CREAT_INPUT.BuyerDeposit);

    const tx = await cdsLounge
      .connect(buyer)
      .create(
        DEFAULT_CREAT_INPUT.InitAssetPrice,
        DEFAULT_CREAT_INPUT.ClaimPrice,
        DEFAULT_CREAT_INPUT.LiquidationPrice,
        DEFAULT_CREAT_INPUT.SellerDeposit,
        DEFAULT_CREAT_INPUT.Premium,
        seller.address,
        DEFAULT_CREAT_INPUT.PremiumRounds,
        DEFAULT_CREAT_INPUT.AssetType,
      );

    const receipt = await tx.wait();
    const { cdsId: id, cds: cdsAddr } = receipt.events[3].args;
    const cds = CDS.attach(cdsAddr);

    return { cds, id, cdsAddr };
  };

  // set accounts balance, deploy contracts
  before(async () => {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    admin = owner;
    buyer = addr1;
    seller = addr2;
    unauthorized = addr3;

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
    CDS = await ethers.getContractFactory('CDS');

    console.log(`
    Contracts
    -----------------------------------------------------------
    Oracle      : ${oracle.address}
    Token       : ${token.address}
    CDS Lounge  : ${cdsLounge.address}
    `);

    // setting contract
    await cdsLounge.setToken(token.address);
    await cdsLounge.setOracle(oracle.address);

    // faucet
    await token.transfer(buyer.address, DEFAULT_FAUCET);
    await token.transfer(seller.address, DEFAULT_FAUCET);
    await token.transfer(unauthorized.address, DEFAULT_FAUCET);
  });

  describe('Initial Settings', async () => {
    it('Faucet check', async () => {
      let bal = await token.balanceOf(buyer.address);
      expect(+bal).to.equal(DEFAULT_FAUCET);

      bal = await token.balanceOf(seller.address);
      expect(+bal).to.equal(DEFAULT_FAUCET);

      bal = await token.balanceOf(unauthorized.address);
      expect(+bal).to.equal(DEFAULT_FAUCET);
    });

    it('Checking Token contract', async () => {
      const tokenContract = await cdsLounge.token();

      expect(tokenContract).to.equal(token.address);
    });

    it('Checking Oracle contract', async () => {
      // checking oracle of cds lounge
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
          DEFAULT_CREAT_INPUT.InitAssetPrice,
          DEFAULT_CREAT_INPUT.ClaimPrice,
          DEFAULT_CREAT_INPUT.LiquidationPrice,
          DEFAULT_CREAT_INPUT.SellerDeposit,
          DEFAULT_CREAT_INPUT.Premium,
          seller.address,
          DEFAULT_CREAT_INPUT.PremiumRounds,
          DEFAULT_CREAT_INPUT.AssetType,
        );

      const receipt = await tx.wait();

      const { cds: cdsAddr } = receipt.events[3].args;
      const cds = CDS.attach(cdsAddr);

      const oracleAddr = await cds.priceOracle();
      expect(oracleAddr).to.equal(oracle.address);
    });
  });

  describe('Create', () => {
    it('should be reverted when allowance is insufficient.', async () => {
      await expect(
        cdsLounge
          .connect(buyer)
          .create(
            DEFAULT_CREAT_INPUT.InitAssetPrice,
            DEFAULT_CREAT_INPUT.ClaimPrice,
            DEFAULT_CREAT_INPUT.LiquidationPrice,
            DEFAULT_CREAT_INPUT.SellerDeposit,
            DEFAULT_CREAT_INPUT.Premium,
            seller.address,
            DEFAULT_CREAT_INPUT.PremiumRounds,
            DEFAULT_CREAT_INPUT.AssetType,
          ),
      ).to.be.revertedWith(REVERT.INSUFFICIENT_ALLOWANCE);
    });

    it('should be reverted when asset type is invalid', async () => {
      const INVALID_ASSET_TYPE = 3;

      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_CREAT_INPUT.BuyerDeposit);

      await expect(
        cdsLounge
          .connect(buyer)
          .create(
            DEFAULT_CREAT_INPUT.InitAssetPrice,
            DEFAULT_CREAT_INPUT.ClaimPrice,
            DEFAULT_CREAT_INPUT.LiquidationPrice,
            DEFAULT_CREAT_INPUT.SellerDeposit,
            DEFAULT_CREAT_INPUT.Premium,
            seller.address,
            DEFAULT_CREAT_INPUT.PremiumRounds,
            INVALID_ASSET_TYPE,
          ),
      ).to.be.revertedWith(REVERT.INVALID_ASSET_TYPE);
    });

    it('should emit event "Create" after proper transaction', async () => {
      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_CREAT_INPUT.BuyerDeposit);

      await expect(
        cdsLounge
          .connect(buyer)
          .create(
            DEFAULT_CREAT_INPUT.InitAssetPrice,
            DEFAULT_CREAT_INPUT.ClaimPrice,
            DEFAULT_CREAT_INPUT.LiquidationPrice,
            DEFAULT_CREAT_INPUT.SellerDeposit,
            DEFAULT_CREAT_INPUT.Premium,
            seller.address,
            DEFAULT_CREAT_INPUT.PremiumRounds,
            DEFAULT_CREAT_INPUT.AssetType,
          ),
      ).to.emit(cdsLounge, 'Create');
    });

    it('CDS contract should have proper state', async () => {
      const { cds, cdsAddr } = await create();

      const buyerAddress = await cds.getBuyer();
      expect(buyerAddress).to.equal(buyer.address);

      const sellerAddress = await cds.getSeller();
      expect(sellerAddress).to.equal(seller.address);

      let prices = (await cds.getPrices()).map((bn) => +bn);

      const defaultPrices = [
        DEFAULT_CREAT_INPUT.InitAssetPrice,
        DEFAULT_CREAT_INPUT.ClaimPrice,
        DEFAULT_CREAT_INPUT.LiquidationPrice,
        DEFAULT_CREAT_INPUT.Premium,
        DEFAULT_CREAT_INPUT.SellerDeposit,
      ];

      for (let i = 0; i < prices.length; i++) {
        expect(prices[i]).to.equal(defaultPrices[i]);
      }

      const status = await cds.status();
      expect(status).to.equal(1);

      const totalRounds = await cds.totalRounds();
      expect(totalRounds).to.equal(DEFAULT_CREAT_INPUT.PremiumRounds);

      const assetType = await cds.assetType();
      expect(assetType).to.equal(DEFAULT_CREAT_INPUT.AssetType);
    });

    it('Buyer and Contract should have proper token balance after creating CDS', async () => {
      const buyerBalanceBefore = await token.balanceOf(buyer.address);
      const contractBalanceBefore = await token.balanceOf(cdsLounge.address);

      await create();

      const buyerBalanceAfter = await token.balanceOf(buyer.address);
      const contractBalanceAfter = await token.balanceOf(cdsLounge.address);

      expect(+buyerBalanceAfter).to.equal(
        +buyerBalanceBefore - DEFAULT_CREAT_INPUT.BuyerDeposit,
        'Buyer balance',
      );
      expect(+contractBalanceAfter).to.equal(
        +contractBalanceBefore + DEFAULT_CREAT_INPUT.BuyerDeposit,
        'Contract balance',
      );
    });
  });

  describe('Accept', () => {
    // create before each case
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = id;
      targetCDSAddr = cdsAddr;
    });

    it('Checking allowance', async () => {
      await expect(
        cdsLounge.connect(seller).accept(targetId),
      ).to.be.revertedWith(REVERT.INSUFFICIENT_ALLOWANCE);
    });

    it('Checking seller', async () => {
      const tx = await token
        .connect(unauthorized)
        .approve(cdsLounge.address, DEFAULT_CREAT_INPUT.SellerDeposit);

      await expect(
        cdsLounge.connect(unauthorized).accept(targetId),
      ).to.be.revertedWith(REVERT.UNAUTHORIZED_SELLER);
    });

    it('Checking event', async () => {});
    it('Checking state of CDS after accept', async () => {});
    it('Checking balance after accept', async () => {});
  });
});
