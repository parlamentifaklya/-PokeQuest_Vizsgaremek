import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { useAudioContext } from '../context/AudioContext';
import Button from '../modules/Button';

const Settings: React.FC = () => {
  const { volume, setVolume } = useAudioContext(); // Access volume and setter from context
  const navigate = useNavigate();

  // Load volume from localStorage when the component mounts
  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
      setVolume(Number(savedVolume)); // Set volume from saved value
    }
  }, [setVolume]);

  // Save volume to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('volume', String(volume)); // Save volume to localStorage
    // Assuming you have an audio element to adjust
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.volume = volume / 100; // Adjust volume of audio element
    }
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value)); // Update volume in context
  };

  const handleClose = () => {
    navigate(-1); // Navigate back when the close button is clicked
  };

  const handleLogout = () => {
    // Remove user data from localStorage to log the user out
    localStorage.removeItem('userData');
    localStorage.removeItem('userInventory');
    localStorage.removeItem('hasVisited');
    // Navigate to the welcome window
    navigate('/login');
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
              onChange={handleVolumeChange} // Change handler to update volume
            />
            <span>{volume}</span>
          </div>

          <div className={styles.buttonHolder}>
            <Button text='Logout' onClick={handleLogout}
              style={{
                backgroundColor: 'yellow',
                fontSize: '30px',
                width: '50%',
                color: 'white',
                WebkitTextStroke: '2px black', // For text stroke
                borderRadius: '10%',
                padding: '5px',
                marginTop: '5vh',
                height: 'fit-content',
              }}
            />
            {/*<button className={styles.buttonTemp} onClick={handleLogout}>Logout</button>*/}
            <Button route="/tutorial" text="Tutorial" 
              style={{
                backgroundColor: 'yellow',
                fontSize: '30px',
                width: '50%',
                color: 'white',
                WebkitTextStroke: '2px black', // For text stroke
                borderRadius: '10%',
                padding: '5px',
                marginTop: '5vh',
                height: 'fit-content',
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
