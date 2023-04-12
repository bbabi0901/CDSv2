const hre = require('hardhat');

const { readAddress, defaultState } = require('./utils');

async function main() {
  try {
    const Oracle = await ethers.getContractFactory('PriceOracleMock');
    const oracle = Oracle.attach(readAddress('oracle'));

    const FUSD = await ethers.getContractFactory('FUSD');
    const fusd = FUSD.attach(readAddress('fusd'));

    const cdsLoungeAddr = readAddress('CDSLounge');
    const CDSLounge = await ethers.getContractFactory('CDSLounge');
    const cdsLounge = CDSLounge.attach(cdsLoungeAddr);

    const CDS = await ethers.getContractFactory('CDS');

    const create = async (buyer, seller, data) => {
      await fusd.connect(buyer).approve(cdsLoungeAddr, data.BuyerDeposit);

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
    };

    const accept = async (seller, id) => {
      const cdsAddr = await cdsLounge.getCDS(id);
      const cds = CDS.attach(cdsAddr);
      const sellerDeposit = await cds.sellerDeposit();

      await fusd.connect(seller).approve(cdsLounge.address, sellerDeposit);

      const tx = await cdsLounge.connect(seller).accept(id);

      const receipt = await tx.wait();
      const { cdsId } = receipt.events[3].args;

      return { cdsId, cdsAddr };
    };

    const payPremium = async (buyer, id) => {
      const cdsAddr = await cdsLounge.getCDS(id);
      const cds = CDS.attach(cdsAddr);
      const premium = await cds.premium();

      await fusd.connect(buyer).approve(cdsLounge.address, premium);
      await cdsLounge.connect(buyer).payPremium(id);
    };

    const payPremiumByDeposit = async (seller, id) => {
      await cdsLounge.connect(seller).payPremiumByDeposit(id);
    };

    const faucet = async (address) => {
      await fusd.transfer(address, defaultState.faucet);
    };
    const setPrice = async (price, asset) => {
      await oracle.setBTCPrice(price);
      switch (asset) {
        case 'BTC':
          await oracle.setBTCPrice(price);
          break;
        case 'ETH':
          await oracle.setETHPrice(price);
          break;
        case 'LINK':
          await oracle.setLinkPrice(price);
          break;
        default:
          break;
      }
    };

    const pendingCase = async (buyer, seller, asset) => {
      console.log(`
      - Case of pending
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      await create(buyer, seller, defaultState[asset]);
    };
    const inactiveCase = async (buyer, seller, asset) => {
      state = {
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
      const { cdsId } = await create(buyer, seller, state[asset]);
      await cdsLounge.connect(buyer).cancel(cdsId);
    };
    const activeCase = async (buyer, seller, asset, byDeposit = false) => {
      console.log(`
      - Case of active
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      const { cdsId } = await create(buyer, seller, defaultState[asset]);
      await accept(seller, cdsId);

      byDeposit
        ? await payPremiumByDeposit(seller, cdsId)
        : await payPremium(buyer, cdsId);
    };
    const closeCase = async (buyer, seller, asset) => {
      console.log(`
      - Case of close
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      const { cdsId } = await create(buyer, seller, state[asset]);
      await accept(seller, cdsId);
      await payPremium(buyer, cdsId);
      await cdsLounge.connect(buyer).close(cdsId);
    };
    const expiredCase = async (buyer, seller, asset, byDeposit = false) => {
      console.log(`
      - Case of expired
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);
      state[asset].PremiumRounds = 4;
      const { cdsId } = await create(buyer, seller, state[asset]);
      await accept(seller, cdsId);

      if (byDeposit) {
        await payPremiumByDeposit(seller, cdsId);
        await payPremiumByDeposit(seller, cdsId);
        await payPremiumByDeposit(seller, cdsId);

        await cdsLounge.connect(seller).expire(cdsId);
      } else {
        await payPremium(buyer, cdsId);
        await payPremium(buyer, cdsId);
        await payPremium(buyer, cdsId);

        await cdsLounge.connect(seller).expire(cdsId);
      }
    };
    const claimCase = async (buyer, seller, asset, price, isClaimed = true) => {
      const caseType = isClaimed ? 'claim / liquidation' : 'claimable';
      console.log(`
      - Case of ${caseType}
      --- Buyer: ${buyer.address} / Seller: ${seller.address} / Asset: ${asset}
      `);

      const { cdsId } = await create(buyer, seller, defaultState[asset]);
      await accept(seller, cdsId);

      await payPremium(buyer, cdsId);
      await payPremium(buyer, cdsId);
      await payPremium(buyer, cdsId);
      await payPremium(buyer, cdsId);

      await setPrice(price, asset);
      if (isClaimed) {
        await cdsLounge.connect(buyer).claim(cdsId);
        // set price back to default
        await setPrice(defaultState[asset].InitAssetPrice, asset);
      }
    };

    // check
    fusdAddr = await cdsLounge.token();
    oracleAddr = await cdsLounge.oracle();
    console.log(`
    Checking for CDS
      CDS LOUNGE ADDR :  ${cdsLoungeAddr}
      Set Oracle ADDR :  ${oracleAddr}
      Set FUSD ADDR   :  ${fusdAddr}
    `);

    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

    // faucet
    await faucet(addr1.address);
    await faucet(addr2.address);
    await faucet(addr3.address);
    await faucet(addr4.address);
    await faucet(addr5.address);

    // Sample cases
    // cases of pending status
    await pendingCase(addr2, addr1, 'BTC');
    await pendingCase(addr3, addr1, 'ETH');
    await pendingCase(addr4, addr1, 'LINK');

    // active -> accept + payPremium or payPremiumByDeposit
    //  payPremium by buyer
    await activeCase(addr2, addr5, 'BTC');
    await activeCase(addr5, addr4, 'ETH');
    await activeCase(addr2, addr3, 'LINK');

    // payPremiumByDeposit by seller
    await activeCase(addr1, addr5, 'BTC', true);
    await activeCase(addr1, addr4, 'ETH', true);
    await activeCase(addr1, addr3, 'LINK', true);

    // inactive -> cancel

    await inactiveCase(addr3, addr2, 'BTC');
    await inactiveCase(addr3, addr2, 'LINK');
    await inactiveCase(addr3, addr2, 'ETH');

    // expired -> close, expired by rounds / deposit
    await closeCase(addr4, addr3, 'BTC');
    await closeCase(addr2, addr1, 'ETH');
    await closeCase(addr1, addr5, 'LINK');

    // by deposit
    await expiredCase(addr4, addr3, 'BTC', true);
    await expiredCase(addr1, addr4, 'ETH', true);
    await expiredCase(addr1, addr4, 'LINK', true);

    // by rounds
    await expiredCase(addr2, addr1, 'BTC', false);
    await expiredCase(addr3, addr1, 'ETH', false);
    await expiredCase(addr4, addr5, 'LINK', false);

    // claimed, liquidation, claimable
    // claim
    await claimCase(addr1, addr2, 'BTC', 21000, true);
    await claimCase(addr5, addr2, 'ETH', 1300, true);
    await claimCase(addr1, addr5, 'LINK', 7, true);

    // liquidate
    await claimCase(addr3, addr4, 'BTC', 19000, true);
    await claimCase(addr3, addr4, 'ETH', 1100, true);
    await claimCase(addr4, addr1, 'LINK', 5, true);

    // claimable
    await claimCase(addr5, addr3, 'BTC', 21000, false);
    await claimCase(addr5, addr3, 'ETH', 1400, false);
  } catch (error) {
    console.log(error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
