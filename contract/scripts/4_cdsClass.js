const hre = require('hardhat');

const { readAddress, defaultState, CDS } = require('./utils');

async function main() {
  try {
    let fusdAddr = readAddress('fusd');
    let oracleAddr = readAddress('oracle');
    let cdsLoungeAddr = readAddress('CDSLounge');

    // local signers
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await hre.ethers.getSigners();

    const cds = CDS.getCDS(owner);
    await cds.setContracts(oracleAddr, fusdAddr, cdsLoungeAddr);

    console.log(`
    Checking for CDS
      CDS LOUNGE ADDR :  ${cdsLoungeAddr}
      Set Oracle ADDR :  ${oracleAddr}
      Set FUSD ADDR   :  ${fusdAddr}
    `);

    fusdAddr = cds.fusd.address;
    oracleAddr = cds.oracle.address;
    cdsLoungeAddr = cds.cdsLounge.address;

    console.log(`
    Checking for CDS
      CDS LOUNGE ADDR :  ${cdsLoungeAddr}
      Set Oracle ADDR :  ${oracleAddr}
      Set FUSD ADDR   :  ${fusdAddr}
    `);

    const beforeFaucet = await cds.fusd.balanceOf(addr1.address);

    // faucet
    await cds.faucet(addr1);
    // await cds.faucet(addr2);
    // await cds.faucet(addr3);
    // await cds.faucet(addr4);
    // await cds.faucet(addr5);

    const afterFaucet = await cds.fusd.balanceOf(addr1.address);
    console.log(beforeFaucet, afterFaucet);

    /*
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
    */
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
