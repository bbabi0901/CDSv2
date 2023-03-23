// modules
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const Search = () => {
  const { address } = useParams();
  const [prices, setPrices] = useState([]);

  return <div>{`Search for ${address}`}</div>;
};

export default Search;
