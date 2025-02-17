import { useState, useEffect } from 'react';
import styles from './GameMenu.module.css';
import Button from '../../modules/Button';
import { Link } from 'react-router-dom';
import { User } from '../../types/User';
import ItemChest from '../GamePages/Chests/ItemChest'; // Import ItemChest

const GameMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isChestOpen, setIsChestOpen] = useState<boolean>(false); // State to control chest opening
  const [opening, setOpening] = useState(false); // State to track if the opening process started

  useEffect(() => {
    // Retrieve the user data from localStorage when the component mounts
    const storedUserData = localStorage.getItem('userData');
    console.log('Stored User Data:', storedUserData); // Debugging log

    if (storedUserData) {
      // Parse and map the user data to the User type
      const parsedData = JSON.parse(storedUserData);

      // Assuming that the decoded token is mapped to this structure
      const userData: User = {
        userName: parsedData.sub, // 'sub' can be used as 'userName'
        userLevel: parseInt(parsedData["User Level"], 10), // Convert 'User Level' from string to number
        userInventory: {}, // Set an empty object or populate this later
        coinAmount: parseInt(parsedData["CoinAmount"], 10),
      };

      setUser(userData); // Set the user data to state
    }
  }, []);

  const openChestHandler = () => {
    setIsChestOpen(true); // Set chest to open
    setOpening(true); // Trigger opening animation in ItemChest
  };

  return (
    <div className={styles.gamemenuBackground}>
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
        <div onClick={openChestHandler}>
          <img className={styles.itemchest} src="itemchest.png" alt="itemchest" />
        </div>

        <Link to={"/"}>
          <img className={styles.summon} src="summon.png" alt="summon" />
        </Link>
      </footer>

      {/* Conditionally render the ItemChest component when chest is opened */}
      {isChestOpen && <ItemChest isOpening={opening} setIsOpening={setOpening} />}
    </div>
  );
};

export default GameMenu;
