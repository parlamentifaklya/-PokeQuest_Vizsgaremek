import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { GetInventory } from '../../../services/ApiServices';
import { Feyling } from "../../../types/Feyling";
import { Item } from "../../../types/Item";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Equip.module.css';
import Header from '../../../modules/Header';
import Button from '../../../modules/Button';

const BASE_URL = "http://localhost:5130/api/";

const Equip = () => {
  const [feylings, setFeylings] = useState<Feyling[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedFeyling, setSelectedFeyling] = useState<Feyling | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEquipSuccess, setIsEquipSuccess] = useState(false); // New state to track equip success
  const userId = JSON.parse(localStorage.getItem('userData') || '{}').sub;
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const inventoryData = await GetInventory(userId);
        setFeylings(inventoryData.ownedFeylings);
        setItems(inventoryData.ownedItems);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    if (userId) {
      fetchInventoryData();
    }
  }, [userId]);

  const handleEquip = async () => {
    if (!selectedFeyling || !selectedItem) {
      alert('Please select a Feyling and an Item!');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}Feylings/EquipItem/equip/${selectedFeyling.feylingId}/${selectedItem.itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to equip item');
      }

      const updatedData = await response.json();
      setFeylings(prevFeylings => prevFeylings.map(f => f.feylingId === selectedFeyling.feylingId ? updatedData.feyling : f));
      setSelectedFeyling(updatedData.feyling);

      // Show toast notification
      toast.success(`Successfully equipped ${selectedItem.itemName} to ${selectedFeyling.feylingName}!`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      // Set equip success state to true
      setIsEquipSuccess(true);

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/gamemenu');
      }, 2000);
      
    } catch (error) {
      console.error('Error equipping item:', error);
      toast.error("Failed to equip item. Please try again.");
    }
  };

  return (
    <div className={styles.equipContainer}>
      <Header />
      {!selectedFeyling && <h2 className={styles.title}>Equip Item to Feyling</h2>}
      <div className={styles.mainContent}>
        {!selectedFeyling && (
          <div className={styles.feylingsHolder}>
            {feylings.map(feyling => (
              <div key={feyling.feylingId} className={styles.feylingCard} onClick={() => setSelectedFeyling(feyling)}>
                <img src={`${BASE_URL}${feyling.feylingImg}`} alt={feyling.feylingName} className={styles.feylingImage} />
                <p>{feyling.feylingName}</p>
              </div>
            ))}
          </div>
        )}

        {selectedFeyling && (
          <div className={styles.selectedFeylingContainer}>
            <h3>{selectedFeyling.feylingName}</h3>
            <div className={styles.itemsContainer}>
              {items.map(item => (
                <div key={item.itemId} className={styles.itemCard} onClick={() => setSelectedItem(item)}>
                  <img src={`${BASE_URL}${item.itemImg}`} alt={item.itemName} className={styles.itemImage} />
                  <p>{item.itemName}</p>
                </div>
              ))}
            </div>
            {selectedItem && !isEquipSuccess && <button className={styles.button} onClick={handleEquip}>Equip {selectedItem.itemName}</button>}
          </div>
        )}
      </div>
      <Button
        style={{ marginTop: "1vh" }}  // No need for cursor style here as it's handled in the component
         route="/gamemenu"
          text="Back"
          disabled={isEquipSuccess} // Disable the "Back" button if equip is successful
      />

    </div>
  );
};


export default Equip;