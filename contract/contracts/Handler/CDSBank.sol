// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import './CDSFactory.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract CDSBank is CDSFactory {
  using SafeMath for uint256;

  IERC20 public token;

  mapping(uint256 => uint256[2]) public deposits;

  constructor() {
    token = IERC20(0xf904778c896C24cC2284E5E5F86BAa4c8F75734D);
  }

  
  // transactions

  function _sendDeposit(uint256 _cdsId, bool _isBuyer) internal returns (bool) {
    uint256 deposit;
    if (_isBuyer) {
      deposit = getCDS(_cdsId).premium().mul(4);
      token.transferFrom(getBuyer(_cdsId), address(this), deposit);
      deposits[_cdsId][0] = deposit;
    } else {
      deposit = getCDS(_cdsId).sellerDeposit();
      token.transferFrom(getSeller(_cdsId), address(this), deposit);
      deposits[_cdsId][1] = deposit;
    }
    return true;
  }

  function _sendFirstPremium(uint256 _cdsId) internal returns (bool) {
    uint256 premium = getCDS(_cdsId).premium();
    bool sent = token.transfer(getSeller(_cdsId), premium);
    require(sent, 'Sending first premium failed');
    deposits[_cdsId][0] -= premium;
    return true;
  }

  function _endCDS(uint256 _cdsId) internal returns (bool) {
    address[2] memory participants = [getBuyer(_cdsId), getSeller(_cdsId)];
    for (uint i = 0; i <= 1; i++) {
      uint256 deposit = deposits[_cdsId][i];
      if (deposit != 0) {
        bool sent = token.transfer(participants[i], deposit);
        require(sent, 'Sending deposit back failed');
      }
    }
    clearDeposit(_cdsId);
    return true;
  }

  function _afterClaim(uint256 _cdsId) internal returns (uint256) {
    uint256 claimReward = getCDS(_cdsId).getClaimReward();
    bool sentBuyer = token.transfer(
      getBuyer(_cdsId),
      claimReward + deposits[_cdsId][0]
    );
    bool sentSeller = token.transfer(
      getSeller(_cdsId),
      deposits[_cdsId][1] - claimReward
    );
    require(sentBuyer && sentSeller, 'Sending reward failed');
    clearDeposit(_cdsId);
    return claimReward;
  }

  function _expire(uint256 _cdsId) internal isSeller(_cdsId) {
    bool isRoundZero = getCDS(_cdsId).checkRoundsZero();
    bool isPayDatePassed = getCDS(_cdsId).checkPayDatePassed();
    bool isDepositZero = (deposits[_cdsId][0] == 0);
    // bool byRounds = (currRounds == 0);
    // bool byDeposit = (deposits[_cdsId][0] == 0);
    require((isRoundZero && isPayDatePassed) || (isDepositZero && isPayDatePassed), 'Buyer deposit / Rounds remaining');
    getCDS(_cdsId).close();
  }

  function _sendPremiumByDeposit(uint256 _cdsId) internal {
    bool isPayDatePassed = getCDS(_cdsId).checkPayDatePassed();
    require(isPayDatePassed, "Invalid date to pay premium by deposit");

    uint256 premium = getCDS(_cdsId).premium();
    require(deposits[_cdsId][0] >= premium, 'Not enough deposit');
    
    bool sent = token.transfer(getSeller(_cdsId), premium);
    require(sent, 'Sending premium failed');

    deposits[_cdsId][0] -= premium;
  }

  function _sendPremium(uint256 _cdsId) internal {
    uint256 nextPayDate = getCDS(_cdsId).nextPayDate();
    require(
      (nextPayDate - 3 days <= block.timestamp) &&
        (block.timestamp <= nextPayDate),
      'Invalid date to pay premium'
    );

    uint256 premium = getCDS(_cdsId).premium();
    bool sent = token.transferFrom(
      getBuyer(_cdsId),
      getSeller(_cdsId),
      premium
    );
    require(sent, 'Sending premium failed');
  }

  function clearDeposit(uint256 _cdsId) private {
    for (uint i = 0; i <= 1; i++) {
      deposits[_cdsId][i] = 0;
    }
  }

  
  // modifiers
  
  modifier isBuyer(uint256 cdsId) {
    require(msg.sender == getBuyer(cdsId), 'Only buyer of the CDS can call');
    _;
  }

  modifier isSeller(uint256 cdsId) {
    require(msg.sender == getSeller(cdsId), 'Only seller of the CDS can call');
    _;
  }

  modifier isParticipants(uint256 cdsId) {
    require(
      msg.sender == getBuyer(cdsId) || msg.sender == getSeller(cdsId),
      'Only buyer/seller of the CDS can call'
    );
    _;
  }
}
