import React from 'react';
import { useEffect, useState } from 'react';
import styles from './GameMenu.module.css';
import Button from '../../modules/Button';
import { Link } from 'react-router-dom';
import { getUser } from '../../services/ApiServices';

const GameMenu = () => {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const data = await getUser('User/GetLoggedIn', token);
          setUserData(data);
        } catch (err) {
          setError('Failed to fetch user data');
          console.error(err);
        }
      } else {
        setError('No authentication token found.');
      }
    };

    fetchUserData();
  }, [token]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.gamemenuBackground}>
      <header className={styles.header}>
        <div className={styles.lvlHolder}>
          <h2 className={styles.textDesign}>Lvl {userData.level}</h2>
        </div>

        <div className={styles.middlePart}>
          <Link to={"/settings"}>
            <img src="settings.png" alt="settings" />
          </Link>

          <h2 className={styles.textDesign}>{userData.username}</h2>
        </div>

        <div className={styles.gemHolder}>
          <img src="gem.png" alt="gem" />

          <h2 className={styles.gemtextStyle}>{userData.gems}</h2>
        </div>
      </header>

      <main className={styles.maincontainer}>
        <div className={styles.buttonHolder}>
          <Button text="Start!!" route='/' />
          <Button text="Equip" route='/' />
          <Button text="Inventory" route='/' />
          <Button text="Feylings" route='/' />
        </div>

        <div className={styles.rightsideContainer}>
          <div className={styles.versionContainer}>
            <h2 className={styles.versionText}>Current Version:</h2>
            <h2 className={styles.versionText}>V1.0</h2>
          </div>
          <img src="Umbrahoundmainpage.png" alt="" />
        </div>
      </main>

      <footer className={styles.chestHolder}>
        <Link to={"/"}>
          <img className={styles.itemchest} src="itemchest.png" alt="itemchest" />
        </Link>

        <Link to={"/"}>
          <img className={styles.summon} src="summon.png" alt="summon" />
        </Link>
      </footer>
    </div>
  );
};

export default GameMenu;
