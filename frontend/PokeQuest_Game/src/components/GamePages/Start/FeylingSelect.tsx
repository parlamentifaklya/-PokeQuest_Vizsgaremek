import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeyling } from '../../../context/FeylingContext';
import { FeylingsFromLocalStorage } from '../../../types/FeylingLocalStorage'; // Import the type
import styles from './FeylingSelect.module.css';
import Button from '../../../modules/Button';

const FeylingSelect = () => {
  const hasReloaded = useRef(false); // Using useRef to track reload state

  useEffect(() => {
    if (!hasReloaded.current) {
      window.location.reload(); // Reload the page once
    }
  }, [hasReloaded]); // Empty dependency array to trigger on the first render only
  hasReloaded.current = true;
  const [selectedFeyling, setSelectedFeyling] = useState<FeylingsFromLocalStorage | null>(null);
  const [warning, setWarning] = useState('');
  const { ownedFeylings, setSelectedFeyling: setContextFeyling } = useFeyling();
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5130/api/";

  const handleFeylingSelect = (feyling: FeylingsFromLocalStorage) => {
    setSelectedFeyling(feyling);
    setWarning('');
  };

  const startGame = () => {
    if (!selectedFeyling) {
      setWarning('Please select a Feyling before starting the game.');
      return;
    }

    // Set the selected Feyling to context and navigate
    setContextFeyling(selectedFeyling);
    navigate('/game');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Your Feyling</h2>
      
      <div className={styles.section}>
        <div className={styles.feylingList}>
          {ownedFeylings.length === 0 ? (
            <p>No feylings available</p>
          ) : (
            ownedFeylings.map((feyling) => (
              <div
                key={feyling.feylingId}  // Use a unique key for each feyling
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
            ))
          )}
        </div>
      </div>

      {warning && <p className={styles.warning}>{warning}</p>}

      <div className={styles.buttonHolder}>
        <Button style={{ marginTop: "1vh" }} route="/gamemenu" text="Back" />
        <Button text="Start Game" route="/game" onClick={startGame} />
      </div>
    </div>
  );
};

export default FeylingSelect;
