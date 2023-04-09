const hre = require('hardhat');

const { writeAddress, readAddress } = require('./utils');

async function main() {
  try {
    let fusdAddr = readAddress('fusd');
    let oracleAddr = readAddress('oracle');

    const CDSLounge = await hre.ethers.getContractFactory('CDSLounge');
    const cdsLounge = await CDSLounge.deploy();

    await cdsLounge.deployed();

    writeAddress('CDSLounge', cdsLounge.address);

    await cdsLounge.setToken(fusdAddr);
    fusdAddr = await cdsLounge.token();

    await cdsLounge.setOracle(oracleAddr);
    oracleAddr = await cdsLounge.oracle();

    // cdsLounge, set contract address
    console.log(`
      CDS LOUNGE ADDR :  ${cdsLounge.address}
      Set Oracle ADDR :  ${oracleAddr}
      Set FUSD ADDR   :  ${fusdAddr}
    `);
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
