import React, { useEffect, useState } from 'react';
import { UserInventory } from '../../../types/User';
import { Feyling } from '../../../types/Feyling';
import { Item } from '../../../types/Item';
import styles from './Inventory.module.css';  
import Header from '../../../modules/Header';
import Button from '../../../modules/Button';

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeylings, setShowFeylings] = useState<boolean>(true);  // State for toggling between Feylings and Items

  const baseUrl = 'http://localhost:5130/api/'; 

  const transformFeyling = (feylingData: any): Feyling => {
    const feylingImg = feylingData.feylingImg || ''; // Default to an empty string if undefined or null
  
    return {
      id: feylingData.id,
      name: feylingData.feylingName,
      description: feylingData.feylingDescription,
      img: feylingImg.startsWith('http') 
        ? feylingImg
        : `${baseUrl}${feylingImg.replace('\\', '/')}`,
      typeId: feylingData.feylingType,
      abilityId: feylingData.feylingAbility,
      isUnlocked: feylingData.feylingIsUnlocked,
      hp: feylingData.feylingHp,
      atk: feylingData.feylingAtk,
      itemId: feylingData.feylingItem,
      weakAgainstId: feylingData.feylingWeakAgainst,
      strongAgainstId: feylingData.feylingStrongAgainst,
      sellPrice: feylingData.feylingSellPrice,
    };
  };
  

  const transformItem = (itemData: any): Item => ({
    id: itemData.itemId,
    name: itemData.itemName,
    description: itemData.itemDescription,
    img: itemData.itemImg,
    itemAbility: itemData.itemAbility,
    rarity: itemData.itemRarity,
    quantity: itemData.itemAmount || 0,  // Extract the itemAmount here
  });

  useEffect(() => {
    const storedInventory = localStorage.getItem('userInventory');
    
    if (storedInventory) {
      const parsedInventory = JSON.parse(storedInventory);
      const transformedInventory: UserInventory = {
        ownedFeylings: parsedInventory.ownedFeylings.map(transformFeyling),
        ownedItems: parsedInventory.ownedItems.map(transformItem),
      };

      setInventory(transformedInventory);
      setLoading(false);
    } else {
      setError('No inventory found in localStorage.');
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!inventory) return <div>No inventory found.</div>;

  return (
    <div className={styles.siteBackground}>
      <Header />

      {/* Toggle Buttons for Feylings/Items */}
      <div className={styles.toggleButtons}>
        <button 
          onClick={() => setShowFeylings(true)} 
          className={showFeylings ? styles.activeButton : ""}
        >
          Feylings
        </button>
        <button 
          onClick={() => setShowFeylings(false)} 
          className={!showFeylings ? styles.activeButton : ""}
        >
          Items
        </button>
      </div>

      {/* Conditional Rendering Based on `showFeylings` State */}
      <div className={styles.section}>
        {showFeylings ? (
          <>
            <h3>Owned Feylings</h3>
            <div className={styles.inventoryList}>
              {inventory.ownedFeylings.length === 0 ? (
                <p>No feylings owned</p>
              ) : (
                inventory.ownedFeylings.map((feyling) => (
                  <div key={feyling.id} className={styles.inventoryItem}>
                    <img src={feyling.img} alt={feyling.name} className={styles.itemImage} />
                    <span className="feylingName">{feyling.name}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <h3>Owned Items</h3>
            <div className={styles.inventoryList}>
              {inventory.ownedItems.length === 0 ? (
                <p>No items owned</p>
              ) : (
                inventory.ownedItems.map((item) => (
                  <div key={item.id} className={styles.inventoryItem}>
                    <img src={`${baseUrl}${item.img}`} alt={item.name} className={styles.itemImage} />
                    <span className="itemName">{item.name} ({item.quantity})</span> {/* Display quantity */}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <Button style={{ marginTop: "1vh" }} route="/gamemenu" text="Back"></Button>
    </div>
  );
};

export default Inventory;
