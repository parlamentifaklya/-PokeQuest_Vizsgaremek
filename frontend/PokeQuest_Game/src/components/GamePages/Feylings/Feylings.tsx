import React, { useEffect, useState } from 'react';
import styles from './Feylings.module.css';
import { GetAllFeylings, GetAllTypes, GetAllAbility } from '../../../services/ApiServices';
import { Feyling } from '../../../types/Feyling';
import { Type } from '../../../types/Type';
import { Ability } from '../../../types/Ability';
import Header from '../../../modules/Header'; // Import Header
import { Link } from 'react-router-dom';
import Button from '../../../modules/Button';

const Feylings = () => {
  const [feylings, setFeylings] = useState<Feyling[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [selectedFeyling, setSelectedFeyling] = useState<Feyling | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAbilityModal, setShowAbilityModal] = useState(false); // State for showing ability modal

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

    const fetchTypes = async () => {
      try {
        const data = await GetAllTypes();
        setTypes(data);
      } catch (error) {
        console.error("Failed to fetch Types:", error);
      }
    };

    const fetchAbilities = async () => {
      try {
        const data = await GetAllAbility();
        setAbilities(data);
      } catch (error) {
        console.error("Failed to fetch Abilities:", error);
      }
    };

    fetchFeylings();
    fetchTypes();
    fetchAbilities();
  }, []);

  if (loading) {
    return <p>Loading Feylings...</p>;
  }

  const handleAbilityButtonClick = () => {
    setShowAbilityModal(true); // Show the ability modal
  };

  const handleCloseAbilityModal = () => {
    setShowAbilityModal(false); // Close the ability modal
  };

  const getTypeImage = (typeId: number) => {
    const type = types.find(t => t.id === typeId);
    return type ? type.img : '';
  };

  const getAbility = (abilityId: number) => {
    const ability = abilities.find(a => a.id === abilityId);
    return ability ? ability : null;
  };

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
      </div>

      {/* Feyling Overlay */}
      {selectedFeyling && !showAbilityModal && (
        <div className={styles.overlay} onClick={() => setSelectedFeyling(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedFeyling(null)}>X</button>
            <img src={selectedFeyling.img} alt={selectedFeyling.name} className={styles.modalImage} />
            <h2>{selectedFeyling.name}</h2>
            <p>{selectedFeyling.description}</p>
            <p><strong>HP:</strong> {selectedFeyling.hp}</p>
            <p><strong>ATK:</strong> {selectedFeyling.atk}</p>
            <p><strong>Sell Price:</strong> {selectedFeyling.sellPrice}</p>

            {/* Type Image */}
            <div className={styles.matchingTypeContainer}>
              <h3>Type:</h3>
              <img src={getTypeImage(selectedFeyling.typeId)} alt="Type" className={styles.matchingTypeImage} />
            </div>

            {/* Ability Button */}
            <button className={styles.abilityButton} onClick={handleAbilityButtonClick}>
              View Ability
            </button>
          </div>
        </div>
      )}

      {/* Ability Modal */}
      {showAbilityModal && selectedFeyling && (
        <div className={styles.overlay} onClick={handleCloseAbilityModal}>
          <div className={styles.abilityModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.abilityCloseButton} onClick={handleCloseAbilityModal}>X</button>
            <h2>Ability: {getAbility(selectedFeyling.abilityId)?.name}</h2>
            <p>{getAbility(selectedFeyling.abilityId)?.description}</p>
            <p><strong>Damage:</strong> {getAbility(selectedFeyling.abilityId)?.damage}</p>
            <p><strong>Health Points:</strong> {getAbility(selectedFeyling.abilityId)?.healthPoint}</p>
            <p><strong>Recharge Time:</strong> {getAbility(selectedFeyling.abilityId)?.rechargeTime}s</p>

            <img
              src={getAbility(selectedFeyling.abilityId)?.img || ''}
              alt={getAbility(selectedFeyling.abilityId)?.name}
              className={styles.abilityModalImage}
            />
          </div>
        </div>
      )}

      <div className={styles.buttonHolder}>
        <Button text='Back' route='/gamemenu' />
      </div>
    </div>
  );
};

export default Feylings;
