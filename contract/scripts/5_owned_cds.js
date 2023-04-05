// this script migrates EWEToken
const CDSLounge = artifacts.require('CDSLounge');
const CDS = artifacts.require('CDS');

module.exports = async function (deployer, network, accounts) {
  console.log(`Triggering Initial TXs ON : ** ${network.toUpperCase()} **`);
  try {
    // settings
    const cdsLounge = await CDSLounge.at(
      '0x8DEC14C04d7e6b0709225806274b5d7843C9d64A',
    );

    const ownedCDS = await cdsLounge.getOwnedCDS(accounts[1]);
    console.log(ownedCDS);
  } catch (err) {
    console.error(err);
  }
};
