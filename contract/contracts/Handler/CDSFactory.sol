// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '../CDS/CDS.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

// import 'hardhat/console.sol';

contract CDSFactory {
  using Counters for Counters.Counter;
  Counters.Counter internal _cdsId;

  mapping(uint256 => CDS) private _cdsList;
  mapping(address => address[]) private ownedCDS;

  address public oracle;

  function setOracle(address _oracle) external {
    oracle = _oracle;
  }

  function _create(
    uint256 _initAssetPrice,
    uint256 _claimPrice,
    uint256 _liquidationPrice,
    uint256 _sellerDeposit,
    uint256 _premium,
    address _seller,
    uint32 _totalRounds,
    uint32 _assetType
  ) internal returns (uint256) {
    _cdsId.increment();
    uint256 newCDSId = _cdsId.current();

    // console.log('Creating', newCDSId);

    CDS newCDS = new CDS(
      oracle,
      _initAssetPrice,
      _claimPrice,
      _liquidationPrice,
      _premium,
      _sellerDeposit,
      _totalRounds,
      _assetType
    );
    _cdsList[newCDSId] = newCDS;
    // newCDS.setParticipants(msg.sender, _isBuyer);
    newCDS.setBuyer(msg.sender);
    newCDS.setSeller(_seller);
    return newCDSId;
  }

  function _accept(
    // bool _isBuyerHost, // true when seller is accepting
    // uint256 _initAssetPrice,
    uint256 _targetCDSId
  ) internal {
    CDS targetCDS = _cdsList[_targetCDSId];

    // targetCDS.accept(_initAssetPrice, msg.sender, _isBuyerHost);
    targetCDS.accept();

    ownedCDS[targetCDS.getBuyer()].push(address(targetCDS));
    ownedCDS[targetCDS.getSeller()].push(address(targetCDS));
  }

  function _cancel(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).cancel();
  }

  function _close(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).close();
  }

  function _claim(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).claim();
  }

  function _payPremium(uint256 _targetCDSId) internal {
    getCDS(_targetCDSId).premiumPaid();
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

  function getOwnedCDS(address owner) external view returns (address[] memory) {
    return ownedCDS[owner];
  }
}
