const { expect } = require('chai');
const { ethers } = require('hardhat');

const { expectRevert } = require('@openzeppelin/test-helpers');
const { INIT_PRICE } = require('./utils');

describe('Mocking Oracle', async () => {
  let oracle, currPrice, modifiedPrice;

  before(async () => {
    const Oracle = await ethers.getContractFactory('PriceOracleMock');
    oracle = await Oracle.deploy();
    await oracle.deployed();
  });

  after(async () => {
    await oracle.setBTCPrice(INIT_PRICE.BTC);
    await oracle.setETHPrice(INIT_PRICE.ETH);
    await oracle.setLinkPrice(INIT_PRICE.LINK);
  });

  it('should have proper initial value', async () => {
    currPrice = await oracle.btcPrice();
    expect(INIT_PRICE.BTC).to.equal(currPrice.toNumber());

    currPrice = await oracle.ethPrice();
    expect(INIT_PRICE.ETH).to.equal(currPrice.toNumber());

    currPrice = await oracle.linkPrice();
    expect(INIT_PRICE.LINK).to.equal(currPrice.toNumber());
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
