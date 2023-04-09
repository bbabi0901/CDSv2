const hre = require('hardhat');

const { writeAddress, readAddress } = require('./utils');

async function main() {
  try {
    let oracleAddr = readAddress('oracle');
    if (!oracleAddr) {
      const Oracle = await hre.ethers.getContractFactory('PriceOracleMock');
      const oracle = await Oracle.deploy();
      await oracle.deployed();

      oracleAddr = oracle.address;
      writeAddress('oracle', oracleAddr);
    }
    console.log(`Oracle deployed to ${oracleAddr}`);
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
