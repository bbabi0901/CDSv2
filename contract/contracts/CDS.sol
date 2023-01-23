// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import './Swaps/Swaps.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract CDS is Swaps, Ownable {
  using SafeMath for uint256;

  constructor() payable {}

  modifier isNotOwner() {
    require(msg.sender != owner(), 'Owner can not call the method');
    _;
  }

  event MakeSwap(
    address indexed buyer,
    uint256 claimPrice,
    uint256 liquidationPrice,
    uint256 premium,
    uint256 premiumInterval,
    uint256 totalPremiumRounds,
    uint256 buyerDeposit
  );
  event AcceptSwap(address indexed seller, uint256 swapId);

  function makeSwap(
    address addr,
    uint256 initAssetPrice,
    uint256 claimPrice,
    uint256 liquidationPrice,
    uint256 sellerDeposit,
    uint256 premium,
    uint256 premiumInterval,
    uint256 totalPremiumRounds
  ) public payable isNotOwner returns (uint256) {
    uint256 buyerDeposit = premium.mul(3) * 1 ether;
    require(buyerDeposit == msg.value, 'Invalid eth amount');
    payable(owner()).transfer(msg.value);

    uint256 newSwapId = _makeSwap(
      addr,
      initAssetPrice,
      claimPrice,
      liquidationPrice,
      sellerDeposit,
      premium,
      premiumInterval,
      totalPremiumRounds
    );

    emit MakeSwap(
      addr,
      claimPrice,
      liquidationPrice,
      premium,
      premiumInterval,
      totalPremiumRounds,
      buyerDeposit
    );

    return newSwapId;
  }

  function acceptSwap(
    address addr,
    uint256 initAssetPrice,
    uint256 swapId
  ) public payable isNotOwner returns (uint256) {
    uint256 sellerDeposit = _swaps[swapId].seller.deposit;
    require(sellerDeposit == msg.value, 'Invalid eth amount');
    payable(owner()).transfer(msg.value);

    uint256 acceptedSwapId = _acceptSwap(addr, initAssetPrice, swapId);
    emit AcceptSwap(addr, swapId);
    return acceptedSwapId;
  }

  function getSwap(uint256 swapId) public view returns (Swap memory) {
    return _swaps[swapId];
  }

  function getBuyer(uint256 swapId) public view returns (Buyer memory) {
    return _swaps[swapId].buyer;
  }

  function getSeller(uint256 swapId) public view returns (Seller memory) {
    return _swaps[swapId].seller;
  }

  function getSwapId() public view returns (Counters.Counter memory) {
    return _swapId;
  }
}
