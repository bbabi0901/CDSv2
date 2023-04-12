const { ethers } = require('hardhat');
const fs = require('fs');

const { ORACLE_ABI, FUSD_ABI, CDSLOUNGE_ABI, CDS_ABI } = require('./abi');

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
  faucet: 20000000,
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
  CDS: class CDS {
    instance;
    provider;
    endPoint;
    gasPrice;
    owner;

    constructor(owner, endPoint) {
      this.endPoint = endPoint;
      this.provider = new ethers.providers.JsonRpcProvider(endPoint);
      this.gasPrice = this.provider.getGasPrice();
      this.owner = owner;
    }

    static getCDS(owner, endPoint = 'http://localhost:8545') {
      if (!CDS.instance) {
        CDS.instance = new CDS(owner, endPoint);
      } else {
        CDS.endPoint = endPoint; //
      }
      return CDS.instance;
    }

    async setContracts(oracle, fusd, cdsLounge) {
      // const signer = this.owner.connect(this.provider);
      // Error: cannot alter JSON-RPC Signer connection (operation="connect", code=UNSUPPORTED_OPERATION, version=providers/5.7.2)
      // 132줄 때문에 오류 발생 => 왜냐면 owner가 이미 connect상태라서 connect가 불필요였음.

      this.oracle = new ethers.Contract(oracle, ORACLE_ABI, this.owner);

      this.fusd = new ethers.Contract(fusd, FUSD_ABI, this.owner);

      this.cdsLounge = new ethers.Contract(
        cdsLounge,
        CDSLOUNGE_ABI,
        this.owner,
      );
    }

    async create(buyer, seller, data) {
      const fusd = new ethers.Contract(this.fusd.address, FUSD_ABI, buyer);
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        buyer,
      );

      await fusd.approve(this.cdsLounge.address, data.BuyerDeposit);
      const tx = await cdsLounge
        .connect(buyer)
        .create(
          data.InitAssetPrice,
          data.ClaimPrice,
          data.LiquidationPrice,
          data.SellerDeposit,
          data.Premium,
          seller.address,
          data.PremiumRounds,
          data.AssetType,
        );

      const receipt = await tx.wait();
      const { cdsId, cds } = receipt.events[3].args;

      return { cdsId, cds };
    }

    async getCDSInstance(signer, id) {
      const cdsAddr = await this.cdsLounge.getCDS(id);
      const cds = new ethers.Contract(cdsAddr, CDS_ABI, signer);

      return cds;
    }

    async accept(seller, id) {
      const fusd = new ethers.Contract(this.fusd.address, FUSD_ABI, seller);
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        seller,
      );

      const cds = await this.getCDSInstance(seller, id);

      const sellerDeposit = await cds.sellerDeposit();

      await fusd.approve(this.cdsLounge.address, +sellerDeposit);

      const tx = await cdsLounge.accept(id);

      const receipt = await tx.wait();
      const { cdsId } = receipt.events[3].args;

      return { cdsId };
    }

    async payPremium(buyer, id) {
      const fusd = new ethers.Contract(this.fusd.address, FUSD_ABI, buyer);
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        buyer,
      );

      const cds = await this.getCDSInstance(buyer, id);

      const premium = await cds.premium();

      await fusd.approve(this.cdsLounge.address, +premium);
      await cdsLounge.payPremium(id);
    }

    async payPremiumByDeposit(seller, id) {
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        seller,
      );
      await cdsLounge.payPremiumByDeposit(id);
    }

    async faucet(wallet) {
      const tx = await this.fusd.transfer(wallet.address, defaultState.faucet);
    }

    async cancel(signer, id) {
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        signer,
      );
      await cdsLounge.cancel(id);
    }

    async close(signer, id) {
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        signer,
      );
      await cdsLounge.close(id);
    }

    async expire(signer, id) {
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        signer,
      );
      await cdsLounge.expire(id);
    }

    async claim(signer, id) {
      const cdsLounge = new ethers.Contract(
        this.cdsLounge.address,
        CDSLOUNGE_ABI,
        signer,
      );
      await cdsLounge.claim(id);
    }

    async setPrice(price, asset) {
      await this.oracle.setBTCPrice(price);
      switch (asset) {
        case 'BTC':
          await this.oracle.setBTCPrice(price);
          break;
        case 'ETH':
          await this.oracle.setETHPrice(price);
          break;
        case 'LINK':
          await this.oracle.setLinkPrice(price);
          break;
        default:
          break;
      }
    }

    async pendingCase(buyer, seller, asset) {
      console.log(`
      - Case of pending
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      await this.create(buyer, seller, defaultState[asset]);
    }

    async inactiveCase(buyer, seller, asset) {
      const state = {
        BTC: {
          InitAssetPrice: 30000,
          ClaimPrice: 20000,
          LiquidationPrice: 15000,
          SellerDeposit: 150000,
          Premium: 1500,
          PremiumRounds: 12,
          BuyerDeposit: 6000,
          AssetType: 0,
        },
        ETH: {
          InitAssetPrice: 2000,
          ClaimPrice: 1200,
          LiquidationPrice: 800,
          SellerDeposit: 12000,
          Premium: 250,
          PremiumRounds: 12,
          BuyerDeposit: 1000,
          AssetType: 1,
        },
        LINK: {
          InitAssetPrice: 10,
          ClaimPrice: 6,
          LiquidationPrice: 4,
          SellerDeposit: 6000,
          Premium: 80,
          PremiumRounds: 12,
          BuyerDeposit: 320,
          AssetType: 2,
        },
      };

      console.log(`
      - Case of inactive
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      const { cdsId } = await this.create(buyer, seller, state[asset]);
      await this.cancel(buyer, cdsId);
    }

    async activeCase(buyer, seller, asset, byDeposit = false) {
      console.log(`
      - Case of active
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      const { cdsId } = await this.create(buyer, seller, defaultState[asset]);
      await this.accept(seller, cdsId);

      byDeposit
        ? await this.payPremiumByDeposit(seller, cdsId)
        : await this.payPremium(buyer, cdsId);
    }

    async closeCase(buyer, seller, asset) {
      console.log(`
      - Case of close
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      const { cdsId } = await this.create(buyer, seller, defaultState[asset]);
      await this.accept(seller, cdsId);
      await this.payPremium(buyer, cdsId);

      await this.close(buyer, cdsId);
    }

    async expiredCase(buyer, seller, asset, byDeposit = false) {
      console.log(`
      - Case of expired
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);

      const state = defaultState;
      state[asset].PremiumRounds = 4;
      const { cdsId } = await this.create(buyer, seller, state[asset]);
      await this.accept(seller, cdsId);

      if (byDeposit) {
        await this.payPremiumByDeposit(seller, cdsId);
        await this.payPremiumByDeposit(seller, cdsId);
        await this.payPremiumByDeposit(seller, cdsId);

        await this.expire(seller, cdsId);
      } else {
        await this.payPremium(buyer, cdsId);
        await this.payPremium(buyer, cdsId);
        await this.payPremium(buyer, cdsId);

        await this.expire(seller, cdsId);
      }
    }

    async claimCase(buyer, seller, asset, price, isClaimed = true) {
      const caseType = isClaimed ? 'claim / liquidation' : 'claimable';
      console.log(`
      - Case of ${caseType}
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);

      const { cdsId } = await this.create(buyer, seller, defaultState[asset]);
      await this.accept(seller, cdsId);

      await this.payPremium(buyer, cdsId);
      await this.payPremium(buyer, cdsId);
      await this.payPremium(buyer, cdsId);
      await this.payPremium(buyer, cdsId);

      await this.setPrice(price, asset);
      if (isClaimed) {
        await this.claim(buyer, cdsId);
        // set price back to default
        await this.setPrice(defaultState[asset].InitAssetPrice, asset);
      }
    }
  },
};
