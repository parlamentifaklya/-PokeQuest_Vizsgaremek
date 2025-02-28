import React, { useState, useEffect, useRef } from 'react';
import { GetInventory } from '../../../services/ApiServices';
import { Feyling } from "../../../types/Feyling";
import { Item } from "../../../types/Item";
import { UserInventory } from "../../../types/User";
import styles from './Equip.module.css';
import Header from '../../../modules/Header';

const BASE_URL = "http://localhost:5130/api/"; // Base URL for images

// Constants for rarity labels
const RARITY_LABELS = {
  0: "common",
  1: "uncommon",
  2: "rare",
  3: "epic",
  4: "legendary"
};

// Helper function to map rarity value to its string representation
const getRarityLabel = (rarity: number): string => {
  return RARITY_LABELS[rarity] || "unknown"; // Return "unknown" if the rarity doesn't exist in RARITY_LABELS
};

// Helper function to get the correct image URL
const getImageUrl = (path: string | undefined): string => {
  if (!path) return "default-image-url"; // Fallback if no image path
  return path.startsWith("http") ? path : `${BASE_URL}${path.replace(/\\/g, '/')}`;
};

const Equip = () => {
  const [feylings, setFeylings] = useState<Feyling[]>([]); 
  const [items, setItems] = useState<Item[]>([]); 
  const [selectedFeyling, setSelectedFeyling] = useState<Feyling | null>(null); 
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); 
  const [userInventory, setUserInventory] = useState<UserInventory | null>(null); 
  const [showSuccess, setShowSuccess] = useState(false);  // State for showing success overlay
  const userId = JSON.parse(localStorage.getItem('userData') || '{}').sub; // Get userId from localStorage
  
  const feylingRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  // Fetch Feylings and Items from the user's inventory
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        // Fetching user inventory
        const inventoryData = await GetInventory(userId);
        console.log('Fetched Inventory Data:', inventoryData); // Log the response to check the API result
        setUserInventory(inventoryData); // Set the user inventory
        setFeylings(inventoryData.ownedFeylings); // Set owned Feylings
        setItems(inventoryData.ownedItems); // Set owned Items
      } catch (error) {
        console.error('Error fetching inventory:', error); // Log any error that occurs
      }
    };

    if (userId) {
      fetchInventoryData();
    }
  }, [userId]);

  // Handle Feyling selection
  const handleFeylingSelect = (feyling: Feyling) => {
    setSelectedFeyling(feyling);
  };

  // Handle Item selection
  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
  };

  // Simulate Equip action (update the local state)
  const handleEquip = () => {
    if (!selectedFeyling || !selectedItem) {
      alert('Please select a Feyling and an Item!');
      return;
    }

    // Log the selected Feyling and Item to the console
    console.log('Selected Feyling:', selectedFeyling);
    console.log('Selected Item:', selectedItem);

    // Simulate equipping item to feyling by updating state
    const updatedFeylings = feylings.map(feyling => {
      if (feyling.feylingId === selectedFeyling.feylingId) {  // Use feylingId to compare
        return {
          ...feyling,
          feylingItem: selectedItem.itemId, // Update the feylingItem with selected itemId
        };
      }
      return feyling;
    });

    // Update the state with the new feyling data
    setFeylings(updatedFeylings);
    setShowSuccess(true);  // Show success message
    setTimeout(() => setShowSuccess(false), 3000);  // Hide the success message after 3 seconds
  };

  // Ensure the inventory data is loaded
  if (!feylings.length || !items.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.equipContainer}>
      <Header />
      
      {/* Display the title only if no Feyling is selected */}
      {!selectedFeyling && <h2 className={styles.title}>Equip Item to Feyling</h2>}
      
      <div className={styles.mainContent}>
        {/* Display Feylings only if no Feyling is selected */}
        {!selectedFeyling && (
          <div
            className={styles.feylingsHolder}
            ref={feylingRef}
          >
            {feylings.map((feyling) => (
              <div key={feyling.feylingId} className={styles.feylingCard}>
                <img
                  src={getImageUrl(feyling.feylingImg)}
                  alt={feyling.feylingName}
                  className={styles.feylingImage}
                  onClick={() => handleFeylingSelect(feyling)}
                />
                <p className={styles.feylingName}>{feyling.feylingName}</p>
              </div>
            ))}
          </div>
        )}

        {/* Display Selected Feyling and Its Items */}
        {selectedFeyling && (
          <div className={styles.selectedFeylingContainer}>
            <div className={styles.selectedFeylingName}>
              {selectedFeyling.feylingName}
            </div>
            <div
              className={styles.itemsContainer}
              ref={itemRef}
            >
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className={styles.itemCard}
                  onClick={() => handleItemSelect(item)}
                >
                  <img
                    src={getImageUrl(item.itemImg)}
                    alt={item.itemName}
                    className={styles.itemImage}
                  />
                  <p className={styles.itemRarity}>
                    {getRarityLabel(item.itemRarity)} {/* Updated to item.itemRarity */}
                  </p>
                </div>
              ))}
            </div>

            {/* Equip Button */}
            <div className={styles.buttonContainer}>
              {selectedItem && (
                <button className={styles.button} onClick={handleEquip}>
                  Equip {selectedItem.itemName}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className={`${styles.successOverlay} show`}>
          <div className={styles.successMessage}>
            Item successfully equipped!
          </div>
        </div>
      )}
    </div>
  );
};

export default Equip;
