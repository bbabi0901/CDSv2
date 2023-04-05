const { expect } = require('chai');
const { ethers } = require('hardhat');

const { expectRevert } = require('@openzeppelin/test-helpers');

const INIT_BTC_PRICE = 2500000000000;
const INIT_ETH_PRICE = 160000000000;
const INIT_LINK_PRICE = 750000000;

describe('oracleMock', async () => {
  let oracle, currPrice, modifiedPrice;

  before(async () => {
    const Oracle = await ethers.getContractFactory('PriceOracleMock');
    oracle = await Oracle.deploy();
    await oracle.deployed();
  });

  after(async () => {
    await oracle.setBTCPrice(INIT_BTC_PRICE);
    await oracle.setETHPrice(INIT_ETH_PRICE);
    await oracle.setLinkPrice(INIT_LINK_PRICE);
  });

  it('should have proper initial value', async () => {
    currPrice = await oracle.btcPrice();
    expect(INIT_BTC_PRICE).to.equal(currPrice.toNumber());

    currPrice = await oracle.ethPrice();
    expect(INIT_ETH_PRICE).to.equal(currPrice.toNumber());

    currPrice = await oracle.linkPrice();
    expect(INIT_LINK_PRICE).to.equal(currPrice.toNumber());
  });

  it('should have proper changed value', async () => {
    modifiedPrice = 2200000000000;
    await oracle.setBTCPrice(modifiedPrice);
    currPrice = await oracle.btcPrice();
    expect(modifiedPrice).to.equal(currPrice.toNumber());

    modifiedPrice = 120000000000;
    await oracle.setETHPrice(modifiedPrice);
    currPrice = await oracle.ethPrice();
    expect(modifiedPrice).to.equal(currPrice.toNumber());

    modifiedPrice = 800000000;
    await oracle.setLinkPrice(modifiedPrice);
    currPrice = await oracle.linkPrice();
    expect(modifiedPrice).to.equal(currPrice.toNumber());
  });

  it('should throw error when invalid input provided', async () => {
    const invalidPrice = -1;
    expectRevert(oracle.setBTCPrice(invalidPrice));
  });
});
