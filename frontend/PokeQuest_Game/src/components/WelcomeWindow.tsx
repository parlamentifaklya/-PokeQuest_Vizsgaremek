import React from 'react';
import styles from "./WelcomeWindow.module.css"; 
import Button from '../modules/Button';

const MainMenu: React.FC = () => {
  return (
    <div className={styles.mainMenu}>
      <div className={styles.titleContainer}>
        <img src="PokeQuestIcon.png" alt="Flareon" className={styles.flareonIcon} />
      </div>
      <div className={styles.menuButtons}>
        <Button route='/login' text='Login'/>
        <Button route='/register' text='Register'/>
      </div>
    </div>
  );
};

export default MainMenu;
