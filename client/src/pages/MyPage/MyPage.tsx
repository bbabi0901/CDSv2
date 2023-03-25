// modules
import { useRecoilState } from 'recoil';
import Web3 from 'web3';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

//
import NotAuthorized from '../NotAuthorized';

const Authorized = ({ wallet }: { wallet: IWalletTypes }) => {
  const web3 = new Web3(Web3.givenProvider || 'https://localhost:8545');

  const getOwenedCDS = async () => {
    // const cdsLounge = await web3.eth.Contract();
  };
  return <div>{wallet.address}</div>;
};

const MyPage = () => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);
  console.log('wallet link', wallet.isLinked);

  return (
    <div>
      <div>MyPage</div>
      {wallet.isLinked ? <Authorized wallet={wallet} /> : <NotAuthorized />}
    </div>
  );
};

export default MyPage;
