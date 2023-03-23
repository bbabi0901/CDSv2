import useMetamask from '../../utils/hooks/useMetamask';

const MyPage = () => {
  const isLinked = useMetamask();
  return (
    <div>
      <div>MyPage</div>
      <div>{isLinked ? 'linked' : 'not linked'}</div>
    </div>
  );
};

export default MyPage;
