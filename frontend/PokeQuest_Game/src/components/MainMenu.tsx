import React from 'react';
import { Link } from 'react-router-dom'; 
import styles from "./MainMenu.module.css"; 
import Button from '../modules/Button';

const MainMenu: React.FC = () => {
  return (
    <div className={styles.mainMenu}>
      <div className={styles.titleContainer}>
        <img src="PokeQuestIcon.png" alt="Flareon" className={styles.flareonIcon} />
      </div>

      <div className={styles.menuButtons}>
        <button className={styles.menuButton}>Play</button>
        <Link to={"/settings"}>
          <button className={styles.menuButton}>Settings</button>
        </Link>
      </div>
    </div>
  );
};

export default MainMenu;
