// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import './PriceConsumer.sol';
import '../libs/LibSwap.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

// PriceConsumberGoerli({assetType})
contract CDS is Ownable, PriceConsumer(0x21558C2cDA098e7e0ac7d38775B3E2b4a0945222) {
  using LibSwap for uint256;

  PriceOracleMock private priceOracle;

  enum Status {
    inactive,
    pending,
    active,
    claimed,
    expired
  }
  Status public status;

  uint256 public initAssetPrice;
  uint256 public claimPrice;
  uint256 public liquidationPrice;
  uint256 public premium;
  uint256 public sellerDeposit;
  uint256 public nextPayDate;
  address private buyer;
  address private seller;
  uint32 public rounds;
  uint32 public totalRounds;
  uint32 public assetType;

  constructor(
    uint256 _initAssetPrice,
    uint256 _claimPrice,
    uint256 _liquidationPrice,
    uint256 _premium,
    uint256 _sellerDeposit,
    uint32 _rounds,
    uint32 _assetType
  ) {
    initAssetPrice = _initAssetPrice;
    claimPrice = _claimPrice;
    liquidationPrice = _liquidationPrice;
    premium = _premium;
    sellerDeposit = _sellerDeposit;
    rounds = _rounds;
    totalRounds = _rounds;

    require(
      _assetType == 0 || _assetType == 1 || _assetType == 2,
      'BTC:0, ETH:1, LINK:2'
    );
    assetType = _assetType;

    buyer = address(0);
    seller = address(0);
    status = Status.pending;
  }

  function getPrices() public view returns (uint256[5] memory) {
    return [
      initAssetPrice,
      claimPrice,
      liquidationPrice,
      premium,
      sellerDeposit
    ];
  }

  function getAmountOfAsset() public view returns (uint256) {
    return initAssetPrice.calcAmountOfAsset(
      liquidationPrice,
      sellerDeposit
    );
  }

  function getBuyer() public view returns (address) {
    return buyer;
  }

  function getSeller() public view returns (address) {
    return seller;
  }

  function getClaimReward() public view returns (uint256) {
    uint256 currPrice = getCurrPrice(assetType);
    if (claimPrice < currPrice) {
      return 0;
    }
    return
      sellerDeposit.calcClaimReward(
        liquidationPrice,
        initAssetPrice,
        currPrice
      );
  }

  function setInitAssetPrice(uint256 _initAssetPrice) public returns (uint256) {
    initAssetPrice = _initAssetPrice;
    return initAssetPrice;
  }

  function setStatus(Status _status) public onlyOwner returns (Status) {
    status = _status;
    return status;
  }

  function setParticipants(address _participants, bool _isBuyer) public onlyOwner {
    _isBuyer ? setBuyer(_participants) : setSeller(_participants);
  }

  function setBuyer(address _buyer) public onlyOwner returns (address) {
    buyer = _buyer;
    return buyer;
  }

  function setSeller(address _seller) public onlyOwner returns (address) {
    seller = _seller;
    return seller;
  }

  function setRounds(uint32 _rounds) public onlyOwner returns (uint32) {
    rounds = _rounds;
    return rounds;
  }

  function setNextPayDate() public onlyOwner returns (uint256) {
    nextPayDate += 4 weeks;
    return nextPayDate;
  }

  function premiumPaid() external onlyOwner isActive {
    require(rounds > 0, 'Round already ended');
    nextPayDate += 4 weeks;
    setRounds(rounds - 1);
  }

  function accept(uint256 _initAssetPrice, bool _isBuyerHost) external onlyOwner isPending {
    setInitAssetPrice(_initAssetPrice);
    nextPayDate = block.timestamp + 4 weeks;
    setParticipants(msg.sender, !_isBuyerHost);
    setStatus(CDS.Status.active);
  }

  function cancel() external isPending {
    setStatus(CDS.Status.inactive);
  }

  function close() external isActive {
    setStatus(CDS.Status.expired);
  }

  function claim() external isActive {
    setStatus(CDS.Status.claimed);
  }

  function checkRoundsZero() external view isActive returns (bool) {
    return (rounds == 0);
  }

  function checkPayDatePassed() external view isActive returns (bool) {
    return (block.timestamp >= nextPayDate);
  }

  // modifiers
  modifier isPending() {
    require(
      status == Status.pending,
      'The status of the CDS should be pending'
    );
    _;
  }

  modifier isActive() {
    require(
      status == Status.active,
      'The status of the CDS should be active'
    );
    _;
  }
}
