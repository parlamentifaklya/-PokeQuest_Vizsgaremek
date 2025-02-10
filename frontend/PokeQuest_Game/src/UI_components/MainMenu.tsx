import React from 'react';
import styles from "./MainMenu.module.css"; // Import styles from the CSS module

const MainMenu: React.FC = () => {
  return (
    <div className={styles.mainMenu}>
      {/* Title with Flareon Image */}
      <div className={styles.titleContainer}>
        <img src="PokeQuestIcon.png" alt="Flareon" className={styles.flareonIcon} />
      </div>

      {/* Buttons */}
      <div className={styles.menuButtons}>
        <button className={styles.menuButton}>Play</button>
        <button className={styles.menuButton}>Settings</button>
      </div>
    </div>
  );
};

export default MainMenu;
