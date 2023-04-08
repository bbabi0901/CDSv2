const hre = require('hardhat');

const { readAddress, getAccount, defaultState } = require('./utils');

async function main() {
  try {
    const cdsLoungeAddr = readAddress('CDSLounge');
    const CDSLounge = await hre.ethers.getContractFactory('CDSLounge');
    const cdsLounge = CDSLounge.attach(cdsLoungeAddr);

    // check
    fusdAddr = await cdsLounge.token();
    oracleAddr = await cdsLounge.oracle();
    console.log(`
    Checking for CDS
      CDS LOUNGE ADDR :  ${cdsLoungeAddr}
      Set Oracle ADDR :  ${oracleAddr}
      Set FUSD ADDR   :  ${fusdAddr}
    `);

    // faucet => check하고 나눠주기.
    const FUSD = await hre.ethers.getContractFactory('FUSD');
    const fusd = FUSD.attach(fusdAddr);

    const [owner, ...signers] = await ethers.getSigners();
    const ownerBal = await fusd.balanceOf(owner.address);
    console.log('Owner balance : ', ownerBal);

    for (let signer of signers) {
      const bal = await fusd.balanceOf(signer.address);
      console.log(`Account ${signer.address} has ${bal} of token.`);
    }

    /*
    for (let signer of signers) {
      await fusd.transfer(signer.address, defaultState.faucet);
    }
    */

    // sample case
    // pending -> create

    // active -> accept + payPremium

    // inactive -> cancel

    // active and claimable -> setPrice

    // claimed -> claim

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
