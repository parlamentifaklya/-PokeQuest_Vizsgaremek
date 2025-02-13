import React from 'react'
import styles from './GameMenu.module.css'
import Button from '../../modules/Button';
import { Link } from 'react-router-dom'; 

const GameMenu = () => {
  return (
    <div className={styles.gamemenuBackground}>
      <header className={styles.header}>
        <div className={styles.lvlHolder}>
          <h2 className={styles.textDesign}>Lvl 15</h2>
        </div>

        <div className={styles.middlePart}>

        <Link to={"/settings"}>
            <img src="settings.png" alt="settings" />
        </Link>
         
          <h2 className={styles.textDesign}>Sushi</h2>
        </div>

        <div className={styles.gemHolder}>
          <img src="gem.png" alt="gem"  />
          <h2 className={styles.gemtextStyle}>1300</h2>
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
}

export default GameMenu;
