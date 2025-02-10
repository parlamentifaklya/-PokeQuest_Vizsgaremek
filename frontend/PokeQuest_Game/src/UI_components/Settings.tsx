import React from 'react'
import styles from "./Settings.module.css"

const Settings: React.FC = () => {
    return (
      <div className={styles.mainMenu}>
        <div className={styles.settingsContainer}>
            <div className={styles.uppercontainer}>
                <h2>Settings</h2>
                <button>X</button>
            </div>
        </div>
      </div>
    );
  };

  export default Settings;