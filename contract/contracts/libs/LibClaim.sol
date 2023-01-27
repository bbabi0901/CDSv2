// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

library LibClaim {
  using SafeMath for uint256;

  function calcClaimReward(
    uint256 _deposit,
    uint256 _liquidation,
    uint256 _initial,
    uint256 _amountOfAssets,
    uint256 _current
  ) internal pure returns (uint256) {
    uint256 claimReward;
    if (_liquidation >= _current) {
      claimReward = _deposit;
    } else {
      // uint256 numOfAsset = _deposit.div(_initial.sub(_liquidation));
      claimReward = _amountOfAssets.mul(_initial.sub(_current));
    }
    return claimReward;
  }
}