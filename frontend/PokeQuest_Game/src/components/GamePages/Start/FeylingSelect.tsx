import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeylingSelect.module.css';
import Header from '../../../modules/Header';
import Button from '../../../modules/Button';

const FeylingSelect = () => {
  const [ownedFeylings, setOwnedFeylings] = useState([]);
  const [selectedFeyling, setSelectedFeyling] = useState(null);
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5130/api/";

  useEffect(() => {
    const storedInventory = localStorage.getItem('userInventory');
    const inventory = storedInventory ? JSON.parse(storedInventory) : {};
    setOwnedFeylings(inventory.ownedFeylings || []);
  }, []);

  const handleFeylingSelect = (feyling) => {
    setSelectedFeyling(feyling);
    setWarning('');
  };

  const startGame = () => {
    if (!selectedFeyling) {
      setWarning('Please select a Feyling before starting the game.');
      return;
    }
    localStorage.setItem('selectedFeyling', JSON.stringify(selectedFeyling));
    navigate('/game');
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

      {warning && <p className={styles.warning}>{warning}</p>}
      <button className={styles.startButton} onClick={startGame}>Start Game</button>
      <Button style={{ marginTop: "1vh" }} route="/gamemenu" text="Back"></Button>
    </div>
  );
};

export default FeylingSelect;