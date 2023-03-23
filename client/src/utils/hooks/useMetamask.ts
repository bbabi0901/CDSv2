// modules
import { useEffect, useState } from 'react';

const useMetamask = () => {
  const [metamask, setMetamask] = useState();

  const accountChangeHandler = () => {};

  useEffect(() => {
    if (!window.ethereum) {
      const err = new Error('No installed Metamask');
      console.log(err);
      return false;
    } else {
      window.ethereum.on('accountsChanged', accountChangeHandler);

      setMetamask(window.ethereum);
    }
  }, []);
};

export default useMetamask;
