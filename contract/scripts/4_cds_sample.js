const hre = require('hardhat');

const { readAddress, CDS } = require('./utils');

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

    // faucet
    await cds.faucet(addr1);
    await cds.faucet(addr2);
    await cds.faucet(addr3);
    await cds.faucet(addr4);
    await cds.faucet(addr5);

    // Sample cases
    // cases of pending status
    await cds.pendingCase(addr2, addr1, 'BTC');
    await cds.pendingCase(addr3, addr1, 'ETH');
    await cds.pendingCase(addr4, addr1, 'LINK');

    // active -> accept + payPremium or payPremiumByDeposit
    //  payPremium by buyer
    await cds.activeCase(addr2, addr5, 'BTC');
    await cds.activeCase(addr5, addr4, 'ETH');
    await cds.activeCase(addr2, addr3, 'LINK');

    // payPremiumByDeposit by seller
    await cds.activeCase(addr1, addr5, 'BTC', true);
    await cds.activeCase(addr1, addr4, 'ETH', true);
    await cds.activeCase(addr1, addr3, 'LINK', true);

    // inactive -> cancel
    await cds.inactiveCase(addr3, addr2, 'BTC');
    await cds.inactiveCase(addr3, addr2, 'LINK');
    await cds.inactiveCase(addr3, addr2, 'ETH');

    // expired -> close, expired by rounds / deposit
    await cds.closeCase(addr4, addr3, 'BTC');
    await cds.closeCase(addr2, addr1, 'ETH');
    await cds.closeCase(addr1, addr5, 'LINK');

    // by deposit
    await cds.expiredCase(addr4, addr3, 'BTC', true);
    await cds.expiredCase(addr1, addr4, 'ETH', true);
    await cds.expiredCase(addr1, addr4, 'LINK', true);

    // by rounds
    await cds.expiredCase(addr2, addr1, 'BTC', false);
    await cds.expiredCase(addr3, addr1, 'ETH', false);
    await cds.expiredCase(addr4, addr5, 'LINK', false);

    // claimed, liquidation, claimable
    // claim
    await cds.claimCase(addr1, addr2, 'BTC', 21000, true);
    await cds.claimCase(addr5, addr2, 'ETH', 1300, true);
    await cds.claimCase(addr1, addr5, 'LINK', 7, true);

    // liquidate
    await cds.claimCase(addr3, addr4, 'BTC', 19000, true);
    await cds.claimCase(addr3, addr4, 'ETH', 1100, true);
    await cds.claimCase(addr4, addr1, 'LINK', 5, true);

    // claimable
    await cds.claimCase(addr5, addr3, 'BTC', 21000, false);
    await cds.claimCase(addr5, addr3, 'ETH', 1400, false);
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
