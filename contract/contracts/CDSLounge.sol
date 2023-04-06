// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/access/Ownable.sol';
import './Handler/CDSBank.sol';

// import 'hardhat/console.sol';

interface CDSInterface {
  function create(
    uint256 initAssetPrice,
    uint256 claimPrice,
    uint256 liquidationPrice,
    uint256 sellerDeposit,
    uint256 premium,
    address seller,
    uint32 totalRounds,
    uint32 assetType
  ) external returns (uint256);

  function accept(uint256 cdsId) external returns (uint256);

  function cancel(uint256 cdsId) external returns (bool);

  function close(uint256 cdsId) external returns (bool);

  function claim(uint256 cdsId) external returns (bool);

  function expire(uint256 cdsId) external returns (bool);

  function payPremium(uint256 cdsId) external returns (bool);

  function payPremiumByDeposit(uint256 cdsId) external returns (bool);

  event Create(uint256 cdsId, address cds);
  event Accept(uint256 cdsId);
  event Cancel(uint256 cdsId);
  event Claim(uint256 cdsId, uint256 claimReward);
  event Close(uint256 cdsId);
  event Expire(uint256 cdsId);
  event PayPremium(uint256 cdsId);
}

contract CDSLounge is CDSBank, Ownable, CDSInterface {
  // transactions
  function create(
    uint256 initAssetPrice,
    uint256 claimPrice,
    uint256 liquidationPrice,
    uint256 sellerDeposit,
    uint256 premium,
    address seller,
    uint32 totalRounds,
    uint32 assetType
  ) external override returns (uint256) {
    // console.log('Creating CDS contract by', msg.sender);

    uint256 newCDSId = _create(
      initAssetPrice,
      claimPrice,
      liquidationPrice,
      sellerDeposit,
      premium,
      seller,
      totalRounds,
      assetType
    );
    _sendDeposit(newCDSId, true);

    emit Create(newCDSId, address(getCDS(newCDSId)));
    return newCDSId;
  }

  function accept(uint256 _cdsId) external override returns (uint256) {
    require(msg.sender != getSeller(_cdsId), 'Unauthorized address');

    // bool isSeller = (getSeller(_cdsId) == address(0)); // true when seller is accepting
    _accept(_cdsId);

    _sendDeposit(_cdsId, false); // false when seller is accepting
    _sendFirstPremium(_cdsId);

    emit Accept(_cdsId);
    return _cdsId;
  }

  function cancel(
    uint256 cdsId
  ) external override isParticipants(cdsId) returns (bool) {
    _cancel(cdsId);
    _endCDS(cdsId);
    emit Cancel(cdsId);
    return true;
  }

  function close(
    uint256 cdsId
  ) external override isBuyer(cdsId) returns (bool) {
    _close(cdsId);
    _endCDS(cdsId);
    emit Close(cdsId);
    return true;
  }

  function claim(
    uint256 cdsId
  ) external override isBuyer(cdsId) returns (bool) {
    _claim(cdsId);
    uint256 claimReward = _afterClaim(cdsId);
    emit Claim(cdsId, claimReward);
    return true;
  }

  function expire(uint256 cdsId) external override returns (bool) {
    _expire(cdsId);
    _endCDS(cdsId);
    emit Expire(cdsId);
    return true;
  }

  function payPremium(
    uint256 cdsId
  ) external override isBuyer(cdsId) returns (bool) {
    _payPremium(cdsId);
    _sendPremium(cdsId);
    emit PayPremium(cdsId);
    return true;
  }

  function payPremiumByDeposit(
    uint256 cdsId
  ) external override isSeller(cdsId) returns (bool) {
    _payPremium(cdsId);
    _sendPremiumByDeposit(cdsId);
    emit PayPremium(cdsId);
    return true;
  }
}

// cds contract가 deposit 토큰 들고 있도록.
// cdsLounge는 allowance from cds contract
// 정산도 각 cds 안에서하고 cdsLounge는 수수료 취급.

// pending list => 서버 없이 보여줄 수 있고, offer도 가능.
// 아니면 currId까지 클라이언트에서 반복문 돌려서 확인해서 가져온다?

// 블록체인에서 기록하려면 배열.
