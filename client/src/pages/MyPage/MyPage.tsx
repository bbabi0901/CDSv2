// modules
import { useRecoilState } from 'recoil';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

//
import NotAuthorized from '../NotAuthorized';

const Authorized: React.FC<IWalletTypes> = ({ address, network, isLinked }) => {
  return <div>{address}</div>;
};

const MyPage = () => {
  const [wallet, setWallet] = useRecoilState<IWalletTypes>(walletState);

  return (
    <div>
      <div>MyPage</div>
      {wallet.isLinked ? (
        <Authorized
          address={wallet.address}
          network={wallet.network}
          isLinked={wallet.isLinked}
        />
      ) : (
        <NotAuthorized />
      )}
    </div>
  );
};

export default MyPage;
