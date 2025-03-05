import React, { useState, useEffect } from 'react';
import { FeylingsFromLocalStorage } from '../../../types/FeylingLocalStorage';
import styles from './FeylingSelect.module.css';
import Header from '../../../modules/Header';
import Button from '../../../modules/Button';

const FeylingSelect = () => {
  const [ownedFeylings, setOwnedFeylings] = useState<FeylingsFromLocalStorage[]>([]);
  const [selectedFeyling, setSelectedFeyling] = useState<FeylingsFromLocalStorage | null>(null);
  const BASE_URL = "http://localhost:5130/api/";

  useEffect(() => {
    // Retrieve the feylings data from localStorage when the component mounts
    const storedInventory = localStorage.getItem('userInventory');
    const inventory = storedInventory ? JSON.parse(storedInventory) : {};
    setOwnedFeylings(inventory.ownedFeylings || []);
  }, []);

  const handleFeylingSelect = (feyling: FeylingsFromLocalStorage) => {
    setSelectedFeyling(feyling);
    // Trigger the game to start with the selected feyling
    startGameWithFeyling(feyling);
  };

  const startGameWithFeyling = (feyling: FeylingsFromLocalStorage) => {
    // Implement the logic to start the game with the selected feyling
    //console.log(`Starting the game with: ${feyling.feylingName}`);
    // You can replace the above console log with your game start logic
  };

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.title}>Select Your Feyling</h2>

      <div className={styles.section}>
        <div className={styles.feylingList}>
          {ownedFeylings.length === 0 ? (
            <p>No feylings available</p>
          ) : (
            ownedFeylings.map((feyling) => (
              <div
                key={feyling.feylingId}
                className={`${styles.feylingItem} ${selectedFeyling?.feylingId === feyling.feylingId ? styles.selected : ''}`}
                onClick={() => handleFeylingSelect(feyling)}
              >
                <img
                  src={feyling.feylingImg.startsWith('http') ? feyling.feylingImg : BASE_URL+feyling.feylingImg}
                  alt={feyling.feylingName}
                  className={styles.feylingImage}
                />
                <span className={styles.feylingName}>{feyling.feylingName}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <Button style={{ marginTop: "1vh" }} route="/gamemenu" text="Back"></Button>

    </div>
  );
};

export default FeylingSelect;
