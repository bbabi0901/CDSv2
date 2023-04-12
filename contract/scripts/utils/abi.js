const {
  abi: ORACLE_ABI,
} = require('../../artifacts/contracts/Oracle/PriceOracleMock.sol/PriceOracleMock.json');
const {
  abi: FUSD_ABI,
} = require('../../artifacts/contracts/FUSD.sol/FUSD.json');
const {
  abi: CDSLOUNGE_ABI,
} = require('../../artifacts/contracts/CDSLounge.sol/CDSLounge.json');
const {
  bytecode: CDS_BYTECODE,
} = require('../../artifacts/contracts/CDS/CDS.sol/CDS.json');

const cdsInterface = [
  'constructor(address _oracle, uint256 _initAssetPrice, uint256 _claimPrice, uint256 _liquidationPrice, uint256 _premium, uint256 _sellerDeposit, uint32 _rounds, uint32 _assetType)',

  'function premiumPaid() external',

  'function accept() external',

  'function cancel() external',

  'function close() external',

  'function claim() external',

  'function checkRoundsZero() external view  returns (bool)',

  'function checkPayDatePassed() external view  returns (bool)',

  'function setInitAssetPrice(uint256 _initAssetPrice) public returns (uint256)',

  'function setStatus(Status _status) private  returns (Status)',

  'function setBuyer(address _buyer) public  returns (address)',

  'function setSeller(address _seller) public  returns (address)',

  'function setRounds(uint32 _rounds) private  returns (uint32)',

  'function setNextPayDate() private  returns (uint256)',

  'function getPrices() public view returns (uint256[5] memory)',

  'function getAmountOfAsset() public view returns (uint256)',

  'function getBuyer() public view returns (address)',

  'function getSeller() public view returns (address)',

  'function getClaimReward() public view returns (uint256)',
];

module.exports = {
  ORACLE_ABI,
  FUSD_ABI,
  CDSLOUNGE_ABI,
  CDS_BYTECODE,
  cdsInterface,
};
