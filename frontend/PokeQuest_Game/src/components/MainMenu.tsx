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
        <Button route='/gamemenu' text='Play'/>
        <Button route='/settings' text='Settings'/>
      </div>
    </div>
  );
};

export default MainMenu;
