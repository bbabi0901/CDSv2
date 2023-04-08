const { expect } = require('chai');
const { ethers } = require('hardhat');

const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const { INIT_PRICE, EVENT_TYPES, REVERT, EVENT, decode } = require('./utils');
const { append } = require('express/lib/response');

const DEFAULT_STATE = {
  InitAssetPrice: 25000,
  ClaimPrice: 21250,
  LiquidationPrice: 20000,
  SellerDeposit: 50000,
  Premium: 750,
  PremiumRounds: 12, // total lifecycle of test cds is 2hrs
  BuyerDeposit: 3000,
  AssetType: 0, // BTC:0, ETH:1, LINK:2
};
const DEFAULT_FAUCET = 10000000;

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

  let acceptedCDS = [];

  const create = async () => {
    await token
      .connect(buyer)
      .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

    const tx = await cdsLounge
      .connect(buyer)
      .create(
        DEFAULT_STATE.InitAssetPrice,
        DEFAULT_STATE.ClaimPrice,
        DEFAULT_STATE.LiquidationPrice,
        DEFAULT_STATE.SellerDeposit,
        DEFAULT_STATE.Premium,
        seller.address,
        DEFAULT_STATE.PremiumRounds,
        DEFAULT_STATE.AssetType,
      );

    const receipt = await tx.wait();
    const { cdsId: id, cds: cdsAddr } = receipt.events[3].args;
    const cds = CDS.attach(cdsAddr);

    return { cds, id, cdsAddr };
  };

  const accept = async (id) => {
    await token
      .connect(seller)
      .approve(cdsLounge.address, DEFAULT_STATE.SellerDeposit);

    const tx = await cdsLounge.connect(seller).accept(id);

    const receipt = await tx.wait();
    const { cdsId } = receipt.events[3].args;

    const cdsAddr = await cdsLounge.getCDS(id);
    acceptedCDS.push(cdsAddr);

    return cdsId;
  };

  const payPremium = async (id) => {
    await token
      .connect(buyer)
      .approve(cdsLounge.address, DEFAULT_STATE.Premium);
    await expect(cdsLounge.connect(buyer).payPremium(id)).to.emit(
      cdsLounge,
      'PayPremium',
    );
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
        .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

      const tx = await cdsLounge
        .connect(buyer)
        .create(
          DEFAULT_STATE.InitAssetPrice,
          DEFAULT_STATE.ClaimPrice,
          DEFAULT_STATE.LiquidationPrice,
          DEFAULT_STATE.SellerDeposit,
          DEFAULT_STATE.Premium,
          seller.address,
          DEFAULT_STATE.PremiumRounds,
          DEFAULT_STATE.AssetType,
        );

      const receipt = await tx.wait();

      const { cds: cdsAddr } = receipt.events[3].args;
      const cds = CDS.attach(cdsAddr);

      const oracleAddr = await cds.priceOracle();
      expect(oracleAddr).to.equal(oracle.address);
    });
  });

  describe('Create', () => {
    it('Checking token allowance', async () => {
      await expect(
        cdsLounge
          .connect(buyer)
          .create(
            DEFAULT_STATE.InitAssetPrice,
            DEFAULT_STATE.ClaimPrice,
            DEFAULT_STATE.LiquidationPrice,
            DEFAULT_STATE.SellerDeposit,
            DEFAULT_STATE.Premium,
            seller.address,
            DEFAULT_STATE.PremiumRounds,
            DEFAULT_STATE.AssetType,
          ),
      ).to.be.revertedWith(REVERT.INSUFFICIENT_ALLOWANCE);
    });

    it('should be reverted when asset type is invalid', async () => {
      const INVALID_ASSET_TYPE = 3;

      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

      await expect(
        cdsLounge
          .connect(buyer)
          .create(
            DEFAULT_STATE.InitAssetPrice,
            DEFAULT_STATE.ClaimPrice,
            DEFAULT_STATE.LiquidationPrice,
            DEFAULT_STATE.SellerDeposit,
            DEFAULT_STATE.Premium,
            seller.address,
            DEFAULT_STATE.PremiumRounds,
            INVALID_ASSET_TYPE,
          ),
      ).to.be.revertedWith(REVERT.INVALID_ASSET_TYPE);
    });

    it('should emit event "Create" after proper transaction', async () => {
      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

      await expect(
        cdsLounge
          .connect(buyer)
          .create(
            DEFAULT_STATE.InitAssetPrice,
            DEFAULT_STATE.ClaimPrice,
            DEFAULT_STATE.LiquidationPrice,
            DEFAULT_STATE.SellerDeposit,
            DEFAULT_STATE.Premium,
            seller.address,
            DEFAULT_STATE.PremiumRounds,
            DEFAULT_STATE.AssetType,
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
        DEFAULT_STATE.InitAssetPrice,
        DEFAULT_STATE.ClaimPrice,
        DEFAULT_STATE.LiquidationPrice,
        DEFAULT_STATE.Premium,
        DEFAULT_STATE.SellerDeposit,
      ];

      for (let i = 0; i < prices.length; i++) {
        expect(prices[i]).to.equal(defaultPrices[i]);
      }

      const status = await cds.status();
      expect(status).to.equal(1);

      const totalRounds = await cds.totalRounds();
      expect(totalRounds).to.equal(DEFAULT_STATE.PremiumRounds);

      const assetType = await cds.assetType();
      expect(assetType).to.equal(DEFAULT_STATE.AssetType);
    });

    it('Buyer and Contract should have proper token balance after creating CDS', async () => {
      const buyerBalanceBefore = await token.balanceOf(buyer.address);
      const contractBalanceBefore = await token.balanceOf(cdsLounge.address);

      await create();

      const buyerBalanceAfter = await token.balanceOf(buyer.address);
      const contractBalanceAfter = await token.balanceOf(cdsLounge.address);

      expect(+buyerBalanceAfter).to.equal(
        +buyerBalanceBefore - DEFAULT_STATE.BuyerDeposit,
        'Buyer balance',
      );
      expect(+contractBalanceAfter).to.equal(
        +contractBalanceBefore + DEFAULT_STATE.BuyerDeposit,
        'Contract balance',
      );
    });

    it('Checking deposit in CDSBank', async () => {
      const { id } = await create();
      const buyerDepo = +(await cdsLounge.deposits(id, 0));
      expect(buyerDepo).to.equal(DEFAULT_STATE.BuyerDeposit);
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

    it('Checking token allowance', async () => {
      await expect(
        cdsLounge.connect(seller).accept(targetId),
      ).to.be.revertedWith(REVERT.INSUFFICIENT_ALLOWANCE);
    });

    it('Checking seller address', async () => {
      await token
        .connect(unauthorized)
        .approve(cdsLounge.address, DEFAULT_STATE.SellerDeposit);

      await expect(
        cdsLounge.connect(unauthorized).accept(targetId),
      ).to.be.revertedWith(REVERT.NOT_SELLER);

      // await expect(
      //   cdsLounge.connect(unauthorized).accept(targetId),
      // ).to.be.revertedWithCustomError(cdsLounge, 'UnauthorizedSeller');
    });

    it('should emit event "Accept" after proper transaction', async () => {
      await token
        .connect(seller)
        .approve(cdsLounge.address, DEFAULT_STATE.SellerDeposit);

      await expect(cdsLounge.connect(seller).accept(targetId)).to.emit(
        cdsLounge,
        'Accept',
      );
    });

    it('Checking state of CDS after ACCEPT', async () => {
      // acceptId => getCDS => CDS => state check, nextPayDate, currRounds
      await accept(targetId);

      const currRounds = await targetCDS.rounds();
      expect(currRounds).to.equal(DEFAULT_STATE.PremiumRounds - 1);

      const status = await targetCDS.status();
      expect(status).to.equal(2); // 2: active state
    });

    it('Checking balance after ACCEPT', async () => {
      // beforeAccept seller, cdsLounge
      const beforeAccept = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      // seller should pay sellerDeposit to cdsLounge and recieve premium from it after ACCEPT
      await accept(targetId);

      const afterAccept = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      expect(afterAccept.buyer).to.equal(beforeAccept.buyer);

      expect(afterAccept.seller).to.equal(
        beforeAccept.seller -
          DEFAULT_STATE.SellerDeposit +
          DEFAULT_STATE.Premium,
      );

      expect(afterAccept.cdsLounge).to.equal(
        beforeAccept.cdsLounge +
          DEFAULT_STATE.SellerDeposit -
          DEFAULT_STATE.Premium,
      );
    });

    it('Checking deposit in CDSBank', async () => {
      await accept(targetId);

      const buyerDeposit = +(await cdsLounge.deposits(targetId, 0));
      expect(buyerDeposit).to.equal(
        DEFAULT_STATE.BuyerDeposit - DEFAULT_STATE.Premium,
      );

      const sellerDeposit = +(await cdsLounge.deposits(targetId, 1));
      expect(sellerDeposit).to.equal(DEFAULT_STATE.SellerDeposit);
    });
  });

  describe('Cancel', async () => {
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = +id;
      targetCDSAddr = cdsAddr;
    });

    it('Checking status before calling CANCEL', async () => {
      await accept(targetId);
      await expect(
        cdsLounge.connect(buyer).cancel(targetId),
      ).to.be.rejectedWith(REVERT.NOT_PENDING);
    });

    it('Checking caller', async () => {
      // only buyer or seller can call
      await expect(
        cdsLounge.connect(unauthorized).cancel(targetId),
      ).to.be.rejectedWith(REVERT.NOT_PARTICIPANTS);
    });

    it('Checking state of CDS after CANCEL', async () => {
      // Cancel by buyer
      await expect(cdsLounge.connect(buyer).cancel(targetId)).to.emit(
        cdsLounge,
        'Cancel',
      );
      let status = await targetCDS.status();
      expect(status).to.equal(0); // 0 : inactive

      // Cancel by seller
      const { cds, id } = await create();
      await expect(cdsLounge.connect(seller).cancel(id)).to.emit(
        cdsLounge,
        'Cancel',
      );
      status = await cds.status();
      expect(status).to.equal(0);
    });

    it('Checking balance after CANCEL', async () => {
      const beforeCancel = {
        buyer: +(await token.balanceOf(buyer.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      await cdsLounge.connect(buyer).cancel(targetId);

      const afterCancel = {
        buyer: +(await token.balanceOf(buyer.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      expect(afterCancel.buyer).to.equal(
        beforeCancel.buyer + DEFAULT_STATE.BuyerDeposit,
      );
      expect(afterCancel.cdsLounge).to.equal(
        beforeCancel.cdsLounge - DEFAULT_STATE.BuyerDeposit,
      );
    });

    it('Checking deposit in CDSBank', async () => {
      await cdsLounge.connect(buyer).cancel(targetId);

      const buyerDeposit = +(await cdsLounge.deposits(targetId, 0));
      expect(buyerDeposit).to.equal(0);
    });
  });

  describe('Close', async () => {
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = id;
      targetCDSAddr = cdsAddr;
    });

    it('Checking status before calling CLOSE', async () => {
      await expect(cdsLounge.connect(buyer).close(targetId)).to.be.rejectedWith(
        REVERT.NOT_ACTIVE,
      );
    });

    it('Checking authority', async () => {
      await accept(targetId);
      await expect(
        cdsLounge.connect(unauthorized).close(targetId),
      ).to.be.revertedWith(REVERT.NOT_BUYER);

      await expect(
        cdsLounge.connect(seller).close(targetId),
      ).to.be.revertedWith(REVERT.NOT_BUYER);
    });

    it('Checking state of CDS after CLOSE', async () => {
      await accept(targetId);
      await expect(cdsLounge.connect(buyer).close(targetId)).to.emit(
        cdsLounge,
        'Close',
      );

      const status = await targetCDS.status();
      expect(status).to.equal(4); // 4 : expired
    });

    it('Checking balance after CLOSE', async () => {
      await accept(targetId);

      const beforeClose = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      await cdsLounge.connect(buyer).close(targetId);

      const afterClose = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      expect(afterClose.buyer).to.equal(
        beforeClose.buyer + DEFAULT_STATE.BuyerDeposit - DEFAULT_STATE.Premium,
        'buyer',
      );

      expect(afterClose.seller).to.equal(
        beforeClose.seller + DEFAULT_STATE.SellerDeposit,
        'seller',
      );

      expect(afterClose.cdsLounge).to.equal(
        beforeClose.cdsLounge -
          (DEFAULT_STATE.BuyerDeposit - DEFAULT_STATE.Premium) -
          DEFAULT_STATE.SellerDeposit,
        'cdsLounge',
      );
    });

    it('Checking deposit in CDSBank', async () => {
      await accept(targetId);
      await cdsLounge.connect(buyer).close(targetId);

      const buyerDeposit = +(await cdsLounge.deposits(targetId, 0));
      expect(buyerDeposit).to.equal(0);

      const sellerDeposit = +(await cdsLounge.deposits(targetId, 1));
      expect(sellerDeposit).to.equal(0);
    });
  });

  describe('Claim', async () => {
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = +id;
      targetCDSAddr = cdsAddr;

      await accept(targetId);
    });

    it('Checking status', async () => {
      const { id } = await create();

      await expect(cdsLounge.connect(buyer).claim(id)).to.be.revertedWith(
        REVERT.NOT_ACTIVE,
      );
    });

    it('Checking authority', async () => {
      await expect(
        cdsLounge.connect(seller).claim(targetId),
      ).to.be.revertedWith(REVERT.NOT_BUYER);

      await expect(
        cdsLounge.connect(unauthorized).claim(targetId),
      ).to.be.revertedWith(REVERT.NOT_BUYER);
    });

    // claim when currPrice is above claimPrice
    it('Checking when current price of the asset is above the claim price', async () => {
      const currPrice = 2200000000000;
      await oracle.setBTCPrice(currPrice);

      await expect(cdsLounge.connect(buyer).claim(targetId)).to.be.revertedWith(
        REVERT.NOT_CLAIMABLE,
      );
    });

    // claim when currPrice is btwn claimPrice~liquidationPrice => 21000, claimReward should be 40000
    it('Checking when current price of the asset is below claim price', async () => {
      const currPrice = 2100000000000;

      const numOfAssets =
        DEFAULT_STATE.SellerDeposit /
        (DEFAULT_STATE.InitAssetPrice - DEFAULT_STATE.LiquidationPrice);

      const claimReward =
        numOfAssets * (DEFAULT_STATE.InitAssetPrice - currPrice / 1e8);

      await oracle.setBTCPrice(currPrice);

      const beforeClaim = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      // claimReward
      const claimRewardCDS = await targetCDS.getClaimReward();
      expect(claimReward).to.equal(claimRewardCDS, 'claim reward');

      // event
      await expect(cdsLounge.connect(buyer).claim(targetId)).to.emit(
        cdsLounge,
        'Claim',
      );

      // state of cds
      const status = await targetCDS.status();
      expect(status).to.equal(3, 'status'); // 3 : claimed

      // balance
      const afterClaim = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      expect(afterClaim.buyer).to.equal(
        beforeClaim.buyer +
          DEFAULT_STATE.BuyerDeposit -
          DEFAULT_STATE.Premium +
          +claimRewardCDS,
        'buyer',
      );

      expect(afterClaim.seller).to.equal(
        beforeClaim.seller + DEFAULT_STATE.SellerDeposit - +claimRewardCDS,
        'seller',
      );

      expect(afterClaim.cdsLounge).to.equal(
        beforeClaim.cdsLounge -
          (DEFAULT_STATE.BuyerDeposit - DEFAULT_STATE.Premium) -
          DEFAULT_STATE.SellerDeposit,
        'cdsLounge',
      );

      // deposit
      const buyerDeposit = +(await cdsLounge.deposits(targetId, 0));
      expect(buyerDeposit).to.equal(0);

      const sellerDeposit = +(await cdsLounge.deposits(targetId, 1));
      expect(sellerDeposit).to.equal(0);
    });

    // claim when currPrice is below liquidationPrice
    it('Checking current price of the asset is below liquidation price', async () => {
      const currPrice = 1900000000000;

      const numOfAssets =
        DEFAULT_STATE.SellerDeposit /
        (DEFAULT_STATE.InitAssetPrice - DEFAULT_STATE.LiquidationPrice);

      const claimReward =
        numOfAssets *
        (DEFAULT_STATE.InitAssetPrice - DEFAULT_STATE.LiquidationPrice);

      await oracle.setBTCPrice(currPrice);

      const beforeClaim = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      // claimReward
      const claimRewardCDS = await targetCDS.getClaimReward();
      expect(claimReward).to.equal(claimRewardCDS, 'claim reward');

      // event
      await expect(cdsLounge.connect(buyer).claim(targetId)).to.emit(
        cdsLounge,
        'Claim',
      );

      // state of cds
      const status = await targetCDS.status();
      expect(status).to.equal(3, 'status'); // 3 : claimed

      // balance
      const afterClaim = {
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
        cdsLounge: +(await token.balanceOf(cdsLounge.address)),
      };

      expect(afterClaim.buyer).to.equal(
        beforeClaim.buyer +
          DEFAULT_STATE.BuyerDeposit -
          DEFAULT_STATE.Premium +
          +claimRewardCDS,
        'buyer',
      );

      expect(afterClaim.seller).to.equal(
        beforeClaim.seller + DEFAULT_STATE.SellerDeposit - +claimRewardCDS,
        'seller',
      );

      expect(afterClaim.cdsLounge).to.equal(
        beforeClaim.cdsLounge -
          (DEFAULT_STATE.BuyerDeposit - DEFAULT_STATE.Premium) -
          DEFAULT_STATE.SellerDeposit,
        'cdsLounge',
      );

      // deposit
      const buyerDeposit = +(await cdsLounge.deposits(targetId, 0));
      expect(buyerDeposit).to.equal(0);

      const sellerDeposit = +(await cdsLounge.deposits(targetId, 1));
      expect(sellerDeposit).to.equal(0);
    });
  });

  describe('Pay Premium', async () => {
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = +id;
      targetCDSAddr = cdsAddr;

      await accept(targetId);
    });

    it('Checking status', async () => {
      const { id } = await create();

      await expect(cdsLounge.connect(buyer).payPremium(id)).to.be.revertedWith(
        REVERT.NOT_ACTIVE,
      );
    });

    it('Checking msg sender', async () => {
      await expect(
        cdsLounge.connect(seller).payPremium(targetId),
      ).to.be.revertedWith(REVERT.NOT_BUYER);

      await expect(
        cdsLounge.connect(unauthorized).payPremium(targetId),
      ).to.be.revertedWith(REVERT.NOT_BUYER);
    });

    it('Checking token allowance', async () => {
      await expect(
        cdsLounge.connect(buyer).payPremium(targetId),
      ).to.be.revertedWith(REVERT.INSUFFICIENT_ALLOWANCE);

      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_STATE.Premium - 50);

      await expect(
        cdsLounge.connect(buyer).payPremium(targetId),
      ).to.be.revertedWith(REVERT.INSUFFICIENT_ALLOWANCE);
    });

    it('should fail if round left is 0', async () => {
      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

      const tx = await cdsLounge
        .connect(buyer)
        .create(
          DEFAULT_STATE.InitAssetPrice,
          DEFAULT_STATE.ClaimPrice,
          DEFAULT_STATE.LiquidationPrice,
          DEFAULT_STATE.SellerDeposit,
          DEFAULT_STATE.Premium,
          seller.address,
          1,
          DEFAULT_STATE.AssetType,
        );

      const receipt = await tx.wait();
      const { cdsId: id } = receipt.events[3].args;

      await token
        .connect(seller)
        .approve(cdsLounge.address, DEFAULT_STATE.SellerDeposit);

      await cdsLounge.connect(seller).accept(id); // rounds 0

      await expect(cdsLounge.connect(buyer).payPremium(id)).to.be.revertedWith(
        REVERT.ROUND_OVER,
      );
    });

    it('Checking after "payPremium"', async () => {
      const before = {
        rounds: +(await targetCDS.rounds()),
        payDate: +(await targetCDS.nextPayDate()),
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
      };

      await payPremium(targetId);

      const after = {
        rounds: +(await targetCDS.rounds()),
        payDate: +(await targetCDS.nextPayDate()),
        buyer: +(await token.balanceOf(buyer.address)),
        seller: +(await token.balanceOf(seller.address)),
      };

      // rounds, nextPayDate
      expect(after.rounds).to.equal(before.rounds - 1);
      expect(after.nextPayDate).to.not.equal(before.payDate);

      // balance
      expect(after.buyer).to.equal(before.buyer - DEFAULT_STATE.Premium);
      expect(after.seller).to.equal(before.seller + DEFAULT_STATE.Premium);
    });
  });

  describe('Pay Premium by Deposit', async () => {
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = +id;
      targetCDSAddr = cdsAddr;

      await accept(targetId);
    });

    it('Checking status', async () => {
      const { id } = await create();

      await expect(
        cdsLounge.connect(seller).payPremiumByDeposit(id),
      ).to.be.revertedWith(REVERT.NOT_ACTIVE);
    });

    it('Checking msg sender', async () => {
      await expect(
        cdsLounge.connect(buyer).payPremiumByDeposit(targetId),
      ).to.be.revertedWith(REVERT.NOT_SELLER);

      await expect(
        cdsLounge.connect(unauthorized).payPremiumByDeposit(targetId),
      ).to.be.revertedWith(REVERT.NOT_SELLER);
    });

    it('should fail if round left is 0', async () => {
      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

      const tx = await cdsLounge
        .connect(buyer)
        .create(
          DEFAULT_STATE.InitAssetPrice,
          DEFAULT_STATE.ClaimPrice,
          DEFAULT_STATE.LiquidationPrice,
          DEFAULT_STATE.SellerDeposit,
          DEFAULT_STATE.Premium,
          seller.address,
          1,
          DEFAULT_STATE.AssetType,
        );

      const receipt = await tx.wait();
      const { cdsId: id } = receipt.events[3].args;

      await token
        .connect(seller)
        .approve(cdsLounge.address, DEFAULT_STATE.SellerDeposit);

      await cdsLounge.connect(seller).accept(id); // rounds 0

      await expect(
        cdsLounge.connect(seller).payPremiumByDeposit(id),
      ).to.be.revertedWith(REVERT.ROUND_OVER);
    });

    it('should fail if buyer deposit left is 0', async () => {
      // 3 * premium
      await cdsLounge.connect(seller).payPremiumByDeposit(targetId);

      // 2 * premium
      await cdsLounge.connect(seller).payPremiumByDeposit(targetId);

      // 1 * premium
      await cdsLounge.connect(seller).payPremiumByDeposit(targetId);

      // 0
      await expect(
        cdsLounge.connect(seller).payPremiumByDeposit(targetId),
      ).to.be.revertedWith(REVERT.NO_DEPOSIT_LEFT);
    });

    it('Checking after "payPremiumDeposit"', async () => {
      it('should fail if buyer deposit left is 0', async () => {
        const before = {
          rounds: +(await targetCDS.rounds()),
          payDate: +(await targetCDS.nextPayDate()),
          deposit: +(await cdsLounge.deposits(targetId, 0)),
          cdsLounge: +(await token.balanceOf(cdsLounge.address)),
          seller: +(await token.balanceOf(seller.address)),
        };

        await cdsLounge.connect(seller).payPremiumByDeposit(targetId);

        const after = {
          rounds: +(await targetCDS.rounds()),
          payDate: +(await targetCDS.nextPayDate()),
          deposit: +(await cdsLounge.deposits(targetId, 0)),
          cdsLounge: +(await token.balanceOf(cdsLounge.address)),
          seller: +(await token.balanceOf(seller.address)),
        };

        // rounds, nextPayDate, deposit
        expect(after.rounds).to.equal(before.rounds - 1);
        expect(after.nextPayDate).to.not.equal(before.payDate);
        expect(after.deposit).to.equal(before.deposit - DEFAULT_STATE.Premium);

        // balance
        expect(after.seller).to.equal(before.seller + DEFAULT_STATE.Premium);
        expect(cdsLounge.seller).to.equal(
          cdsLounge.seller - DEFAULT_STATE.Premium,
        );
      });
    });
  });

  describe('Expire by rounds', async () => {
    beforeEach(async () => {
      await token
        .connect(buyer)
        .approve(cdsLounge.address, DEFAULT_STATE.BuyerDeposit);

      const tx = await cdsLounge
        .connect(buyer)
        .create(
          DEFAULT_STATE.InitAssetPrice,
          DEFAULT_STATE.ClaimPrice,
          DEFAULT_STATE.LiquidationPrice,
          DEFAULT_STATE.SellerDeposit,
          DEFAULT_STATE.Premium,
          seller.address,
          2,
          DEFAULT_STATE.AssetType,
        );

      const receipt = await tx.wait();
      const { cdsId: id, cds: cdsAddr } = receipt.events[3].args;
      const cds = CDS.attach(cdsAddr);

      await token
        .connect(seller)
        .approve(cdsLounge.address, DEFAULT_STATE.SellerDeposit);

      await cdsLounge.connect(seller).accept(id); // rounds 0

      this.cds = cds;
      this.id = id;
      this.cdsAddr = cdsAddr;
    });

    it('should fail if round left is not 0', async () => {
      await expect(
        cdsLounge.connect(seller).expire(this.id),
      ).to.be.revertedWith(REVERT.UNABLE_EXPIRE);
    });

    it('should fail if the caller is not the seller', async () => {
      // current round = 1
      await payPremium(this.id);

      // current round = 0
      await expect(cdsLounge.connect(buyer).expire(this.id)).to.be.revertedWith(
        REVERT.NOT_SELLER,
      );

      await expect(
        cdsLounge.connect(unauthorized).expire(this.id),
      ).to.be.revertedWith(REVERT.NOT_SELLER);
    });

    it('Checking after "Expire"', async () => {
      // current round = 1
      await payPremium(this.id);

      // current round = 0
      const before = {
        buyerBalance: +(await token.balanceOf(buyer.address)),
        sellerBalance: +(await token.balanceOf(seller.address)),
        cdsLoungeBalance: +(await token.balanceOf(cdsLounge.address)),
        buyerDeposit: +(await cdsLounge.deposits(this.id, 0)),
        sellerDeposit: +(await cdsLounge.deposits(this.id, 1)),
      };

      await expect(cdsLounge.connect(seller).expire(this.id)).to.emit(
        cdsLounge,
        'Expire',
      );

      const after = {
        status: +(await this.cds.status()),
        buyerBalance: +(await token.balanceOf(buyer.address)),
        sellerBalance: +(await token.balanceOf(seller.address)),
        cdsLoungeBalance: +(await token.balanceOf(cdsLounge.address)),
        buyerDeposit: +(await cdsLounge.deposits(this.id, 0)),
        sellerDeposit: +(await cdsLounge.deposits(this.id, 1)),
      };

      expect(after.status).to.equal(4, 'status');
      expect(after.buyerBalance).to.equal(
        before.buyerBalance + before.buyerDeposit,
        'buyer balance',
      );
      expect(after.sellerBalance).to.equal(
        before.sellerBalance + before.sellerDeposit,
        'seller balance',
      );
      expect(after.cdsLoungeBalance).to.equal(
        before.cdsLoungeBalance - before.sellerDeposit - before.buyerDeposit,
        'seller balance',
      );
      expect(after.buyerDeposit).to.equal(0);
      expect(after.sellerDeposit).to.equal(0);
    });
  });

  describe('Expire by deposits', async () => {
    let targetCDS, targetId, targetCDSAddr;

    beforeEach(async () => {
      const { cds, id, cdsAddr } = await create();
      targetCDS = cds;
      targetId = +id;
      targetCDSAddr = cdsAddr;

      await accept(targetId);

      // 3
      await cdsLounge.connect(seller).payPremiumByDeposit(targetId);
      // 2
      await cdsLounge.connect(seller).payPremiumByDeposit(targetId);
    });

    it('should fail if deposit left is not 0', async () => {
      await expect(
        cdsLounge.connect(seller).expire(targetId),
      ).to.be.rejectedWith(REVERT.UNABLE_EXPIRE);
    });

    it('Checking after "Expire"', async () => {
      // current round = 1
      await cdsLounge.connect(seller).payPremiumByDeposit(targetId);

      // current round = 0
      const before = {
        buyerBalance: +(await token.balanceOf(buyer.address)),
        sellerBalance: +(await token.balanceOf(seller.address)),
        cdsLoungeBalance: +(await token.balanceOf(cdsLounge.address)),
        sellerDeposit: +(await cdsLounge.deposits(targetId, 1)),
      };

      await expect(cdsLounge.connect(seller).expire(targetId)).to.emit(
        cdsLounge,
        'Expire',
      );

      const after = {
        status: +(await targetCDS.status()),
        buyerBalance: +(await token.balanceOf(buyer.address)),
        sellerBalance: +(await token.balanceOf(seller.address)),
        cdsLoungeBalance: +(await token.balanceOf(cdsLounge.address)),
        buyerDeposit: +(await cdsLounge.deposits(targetId, 0)),
        sellerDeposit: +(await cdsLounge.deposits(targetId, 1)),
      };

      expect(after.status).to.equal(4, 'status');
      expect(after.buyerBalance).to.equal(before.buyerBalance, 'buyer balance');
      expect(after.sellerBalance).to.equal(
        before.sellerBalance + before.sellerDeposit,
        'seller balance',
      );
      expect(after.cdsLoungeBalance).to.equal(
        before.cdsLoungeBalance - before.sellerDeposit,
        'seller balance',
      );
      expect(after.buyerDeposit).to.equal(0);
      expect(after.sellerDeposit).to.equal(0);
    });
  });

  describe('Owned CDS', () => {
    it('Checking owned cds', async () => {
      const ownedCDS = await cdsLounge.getOwnedCDS(buyer.address);
      console.log(ownedCDS, ownedCDS.length);
      console.log(acceptedCDS, ownedCDS.length);
    });
  });
});
