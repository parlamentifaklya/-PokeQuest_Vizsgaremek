import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeyling } from '../../../context/FeylingContext';
import { FeylingsFromLocalStorage } from '../../../types/FeylingLocalStorage';
import { toast } from 'react-toastify';  // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import styles
import styles from './FeylingSelect.module.css';
import Button from '../../../modules/Button';
import Header from '../../../modules/Header';

const FeylingSelect = () => {
  const [selectedFeyling, setSelectedFeyling] = useState<FeylingsFromLocalStorage | null>(null);
  const { ownedFeylings, setSelectedFeyling: setContextFeyling } = useFeyling();
  const navigate = useNavigate();
  
  const BASE_URL = "http://localhost:5130/api/";

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      console.log('First visit in this session, reloading the page...');
      localStorage.setItem('hasVisited', 'true');
      window.location.reload();
    } else {
      console.log('Page already visited in this session, no reload needed.');
    }
  }, []);

  const handleFeylingSelect = (feyling: FeylingsFromLocalStorage) => {
    setSelectedFeyling(feyling);
  };

  const startGame = () => {
    if (!selectedFeyling) {
      toast.error('Please select a Feyling before starting the game.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    setContextFeyling(selectedFeyling);
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

      <div className={styles.buttonHolder}>
        <Button style={{ marginTop: '1vh' }} route="/gamemenu" text="Back" />
        <Button text="Start Game" onClick={startGame} />
      </div>
    </div>
  );
};

export default FeylingSelect;
