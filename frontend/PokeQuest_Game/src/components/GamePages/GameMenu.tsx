import styles from './GameMenu.module.css';
import Button from '../../modules/Button';
import { Link } from 'react-router-dom';
import Header from '../../modules/Header';

const GameMenu = () => {
  return (
    <div className={styles.gamemenuBackground}>
      <Header /> {/* Use Header component here */}

      <main className={styles.maincontainer}>
        <div className={styles.buttonHolder}>
          <Button text="Start!!" route='/' />
          <Button text="Equip" route='/' />
          <Button text="Inventory" route='/' />

          <Link to={"/feylings"}>
            <Button text="Feylings" route='/' />
          </Link>
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
        <Link to={"/itemchest"}>
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
