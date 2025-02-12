import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Settings.module.css";

const Settings: React.FC = () => {
  const [volume, setVolume] = useState(50);
  const navigate = useNavigate();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value)); 
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className={styles.settingsBackground}> 
      <div className={styles.settingsContainer}>
        <button className={styles.redX} onClick={handleClose}>X</button> 

        <div className={styles.uppercontainer}>
          <h2 className={styles.textStyle}>Settings</h2>
        </div>

        <div className={styles.lowercontainer}>
          <div className={styles.volumeContainer}>
            <label htmlFor="volume">Volume</label>
            <input 
              className={styles.rangestyle} 
              type="range" 
              name="volume" 
              id="volume" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={handleVolumeChange} 
            />
            <span>{volume}</span>
          </div>

          <div className={styles.buttonHolder}>
            <button className={styles.buttonTemp}>Change Account</button>
            <button className={styles.buttonTemp}>Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
