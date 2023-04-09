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

    const CDS = ethers.getContractFactory('CDS');

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
      const cds = await CDS.attach(cdsAddr);
      const sellerDeposit = await cds.sellerDeposit();

      await token.connect(seller).approve(cdsLounge.address, sellerDeposit);

      const tx = await cdsLounge.connect(seller).accept(id);

      const receipt = await tx.wait();
      const { cdsId } = receipt.events[3].args;

      return { cdsId, cdsAddr };
    };

    const payPremium = async (buyer, id) => {
      const cdsAddr = await cdsLounge.getCDS(id);
      const cds = await CDS.attach(cdsAddr);
      const premium = await cds.premium();

      await token.connect(buyer).approve(cdsLounge.address, premium);
      await cdsLounge.connect(buyer).payPremium(id);
    };

    const faucet = async (address) => {
      await fusd.transfer(address, defaultState.faucet);
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
    // await faucet(addr1.address);
    // await faucet(addr2.address);
    // await faucet(addr3.address);
    // await faucet(addr4.address);
    // await faucet(addr5.address);

    // sample cases
    // pending -> create
    console.log('- Case of pending');
    console.log(
      `--- Buyer: ${addr2.address} / Seller: ${addr1.address} / Asset: BTC`,
    );
    let buyer = addr2;
    let seller = addr1;
    await create(buyer, seller, defaultState.BTC);

    /*
    console.log(
      `--- Buyer: ${addr3.address} / Seller: ${addr1.address} / Asset: ETH`,
    );
    buyer = addr3;
    seller = addr1;
    await create(buyer, seller, defaultState.ETH);

    console.log(
      `--- Buyer: ${addr4.address} / Seller: ${addr1.address} / Asset: LINK`,
    );
    buyer = addr4;
    seller = addr1;
    await create(buyer, seller, defaultState.LINK);
    */

    // active -> accept + payPremium

    // inactive -> cancel

    // active and claimable -> setPrice to btwn cp ~ lp
    // cp를 23000으로 잡은 cds 생성 후 currPrice를 22000으로 바꾸면.
    // 이더는 1500, 1450

    // claimed -> claim
    // 위와 마찬가지로 근데 얘는 클레임을 해버리기.

    // expired -> close, expired by rounds / deposit
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
