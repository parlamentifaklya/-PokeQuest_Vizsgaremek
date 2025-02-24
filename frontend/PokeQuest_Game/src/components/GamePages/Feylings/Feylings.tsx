import React, { useEffect, useState } from 'react';
import styles from './Feylings.module.css';
import { GetAllFeylings } from '../../../services/ApiServices';
import { Feyling } from '../../../types/Feyling';
import Header from '../../../modules/Header'; // Import Header
import { Link } from 'react-router-dom';
import Button from '../../../modules/Button';

const Feylings = () => {
  const [feylings, setFeylings] = useState<Feyling[]>([]);
  const [selectedFeyling, setSelectedFeyling] = useState<Feyling | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeylings = async () => {
      try {
        const data = await GetAllFeylings();
        setFeylings(data);
      } catch (error) {
        console.error("Failed to fetch Feylings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeylings();
  }, []);

  if (loading) {
    return <p>Loading Feylings...</p>;
  }

  return (
    <div className={styles.siteBackground}>
      <Header /> {/* Use the shared header */}

      <div className={styles.feylingsHolder}>
        {feylings.map((feyling) => (
          <img 
            key={feyling.id} 
            src={feyling.img} 
            alt={feyling.name} 
            className={styles.feylingImage} 
            onClick={() => setSelectedFeyling(feyling)}
          />
        ))}

        {/* Overlay Modal */}
        {selectedFeyling && (
          <div className={styles.overlay} onClick={() => setSelectedFeyling(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setSelectedFeyling(null)}>X</button>
              <img src={selectedFeyling.img} alt={selectedFeyling.name} className={styles.modalImage} />
              <h2>{selectedFeyling.name}</h2>
              <p>{selectedFeyling.description}</p>
              <p><strong>HP:</strong> {selectedFeyling.hp}</p>
              <p><strong>ATK:</strong> {selectedFeyling.atk}</p>
              <p><strong>Sell Price:</strong> {selectedFeyling.sellPrice}</p>
            </div>
          </div>
        )}        
      </div>
      <div className={styles.buttonHolder}>
      <Button text='Back' route='/gamemenu'></Button>
      </div>
      
    </div>
  );
};

export default Feylings;
