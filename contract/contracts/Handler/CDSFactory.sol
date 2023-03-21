// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '../CDS/CDS.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract CDSFactory {
  using Counters for Counters.Counter;
  Counters.Counter internal _cdsId;

  mapping(uint256 => CDS) private _cdsList;
  mapping(address => address[]) public ownedCDS;
  // delete mapping[key]

  function _create(
    bool _isBuyer,
    uint256 _initAssetPrice,
    uint256 _claimPrice,
    uint256 _liquidationPrice,
    uint256 _sellerDeposit,
    uint256 _premium,
    uint32 _totalRounds,
    uint32 _assetType
  ) internal returns (uint256) {
    _cdsId.increment();
    uint256 newCDSId = _cdsId.current();

    CDS newCDS = new CDS(
      _initAssetPrice,
      _claimPrice,
      _liquidationPrice,
      _premium,
      _sellerDeposit,
      _totalRounds,
      _assetType
    );
    _cdsList[newCDSId] = newCDS;
    newCDS.setParticipants(msg.sender, _isBuyer);
    return newCDSId;
  }

  function _accept(
    bool _isBuyerHost,
    uint256 _initAssetPrice,
    uint256 _targetCDSId
  ) internal returns (uint256) {
    CDS targetCDS = _cdsList[_targetCDSId];
    
    targetCDS.accept(_initAssetPrice, _isBuyerHost);
    
    ownedCDS[targetCDS.getBuyer()].push(address(targetCDS));
    ownedCDS[targetCDS.getSeller()].push(address(targetCDS));

    return _targetCDSId;
  }

  // function delOwnedCDS(address owner, uint256 cdsId) private returns (bool) {
  //   return true;
  // }

  function _cancel(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).cancel();
  }

  function _close(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).close();
  }

  function _payPremium(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).premiumPaid();
  }

  function _claim(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).claim();
  }

  // getter 
  function getCDSId() public view returns (Counters.Counter memory) {
    return _cdsId;
  }

  function getCDS(uint256 cdsId) public view returns (CDS) {
    return _cdsList[cdsId];
  }

  function getBuyer(uint256 cdsId) public view returns (address) {
    return _cdsList[cdsId].getBuyer();
  }

  function getSeller(uint256 cdsId) public view returns (address) {
    return _cdsList[cdsId].getSeller();
  }

  // modifiers
  // modifier isPending(uint256 cdsId) {
  //   require(
  //     _cdsList[cdsId].status() == CDS.Status.pending,
  //     'The status of the CDS should be pending'
  //   );
  //   _;
  // }

  // modifier isActive(uint256 cdsId) {
  //   require(
  //     _cdsList[cdsId].status() == CDS.Status.active,
  //     'The status of the CDS should be active'
  //   );
  //   _;
  // }
}
