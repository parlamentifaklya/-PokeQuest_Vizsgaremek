import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import { Link } from 'react-router-dom';
import { User } from '../types/User';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      const userData: User = {
        userName: parsedData.sub,
        userLevel: parseInt(parsedData["User Level"], 10),
        userInventory: {},
        coinAmount: parseInt(parsedData["CoinAmount"], 10),
      };

      setUser(userData);
    }
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.lvlHolder}>
        <h2 className={styles.textDesign}>Lvl {user ? user.userLevel : 'Loading...'}</h2>
      </div>

      <div className={styles.middlePart}>
        <Link to={"/settings"}>
          <img src="settings.png" alt="settings" />
        </Link>

        <h2 className={styles.textDesign}>{user ? user.userName : 'Loading...'}</h2>
      </div>

      <div className={styles.gemHolder}>
        <img src="gem.png" alt="gem" />
        <h2 className={styles.gemtextStyle}>{user ? user.coinAmount : 'Loading...'}</h2>
      </div>
    </header>
  );
};

export default Header;
