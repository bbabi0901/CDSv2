import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// css
import styles from './Nav.module.css';

type LinkProps = {
  link: string;
};

const NavLink = ({ link }: LinkProps) => {
  return (
    <div className={styles.Link}>
      <div className={styles.Link_each}>
        <Link to={`/${link}`}>{link.toUpperCase()}</Link>
      </div>
    </div>
  );
};

const Nav = () => {
  const [search, setSearch] = useState('');
  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
  };

  const navigate = useNavigate();
  const submitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    navigate(`/search/${search}`);
    setSearch('');
  };

  const navLinks = ['market', 'create', 'mypage'];

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link to="/">Home</Link>
      </div>
      <div className={styles.searchBar}>
        <form onSubmit={submitHandler}>
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search contracts and accounts..."
          />
        </form>
      </div>
      <div className={styles.GroupLink}>
        {navLinks.map((link) => (
          <NavLink link={link} />
        ))}
      </div>
      <div className={styles.Icon}>
        <Link to="/">
          <FontAwesomeIcon icon={['fas', 'wallet']} size="lg" />
        </Link>
      </div>
    </div>
  );
};

export default Nav;
