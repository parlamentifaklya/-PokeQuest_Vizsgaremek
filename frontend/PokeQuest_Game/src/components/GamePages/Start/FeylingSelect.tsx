import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeylingSelect.module.css';
import Header from '../../../modules/Header';
import Button from '../../../modules/Button';
import { FeylingsFromLocalStorage } from '../../../types/FeylingLocalStorage';

const FeylingSelect = () => {
  const [ownedFeylings, setOwnedFeylings] = useState<FeylingsFromLocalStorage[]>([]);
  const [selectedFeyling, setSelectedFeyling] = useState<FeylingsFromLocalStorage | null>(null);
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5130/api/";

  useEffect(() => {
    const storedInventory = localStorage.getItem('userInventory');
    const inventory = storedInventory ? JSON.parse(storedInventory) : {};
    setOwnedFeylings(inventory.ownedFeylings || []);
  }, []);
  
  const handleFeylingSelect = (feyling: FeylingsFromLocalStorage) => {
    setSelectedFeyling(feyling);
    setWarning('');
  };

  const startGame = () => {
    if (!selectedFeyling) {
      setWarning('Please select a Feyling before starting the game.');
      return;
    }

    // Pass the selectedFeyling as state to the /game route
    navigate('/game', { state: { selectedFeyling } });
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
            ownedFeylings.map((feyling) => {
              return (
                <div
                  key={feyling.feylingId}
                  className={`${styles.feylingItem} ${selectedFeyling?.feylingId === feyling.feylingId ? styles.selected : ''}`}
                  onClick={() => handleFeylingSelect(feyling)}
                >
                  <img
                    src={feyling.feylingImg && feyling.feylingImg.startsWith('http') ? feyling.feylingImg : `${BASE_URL}${feyling.feylingImg}`}
                    alt={feyling.feylingName}
                    className={styles.feylingImage}
                  />
                  <span className={styles.feylingName}>{feyling.feylingName}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {warning && <p className={styles.warning}>{warning}</p>}
      <div className={styles.buttonHolder}>
        <Button text="Start Game" route="/game" onClick={startGame} style={{ marginTop: "1vh" }}/>
        <Button style={{ marginTop: "1vh" }} route="/gamemenu" text="Back"/>
      </div>
    </div>
  );
};

export default FeylingSelect;
