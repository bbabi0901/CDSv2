const hre = require('hardhat');

const { writeAddress, isDeployed, writeEnv } = require('./utils');

async function main() {
  try {
    let fusdAddr = readAddress('fusd');
    if (!fusdAddr) {
      const FUSD = await hre.ethers.getContractFactory('FUSD');
      const fusd = await FUSD.deploy();
      await fusd.deployed();

      fusdAddr = fusd.address;
      writeAddress('fusd', fusdAddr);
    }
    console.log(`FUSD deployed to ${fusdAddr}`);
    writeEnv('FUSD_ADDR', fusdAddr);
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
