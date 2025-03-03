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

  const transformFeyling = (feylingData: any): Feyling => ({
    feylingId: feylingData.feylingId,
    feylingName: feylingData.feylingName,
    feylingDescription: feylingData.feylingDescription,
    feylingImg: feylingData.feylingImg.startsWith('http') 
      ? feylingData.feylingImg
      : `${baseUrl}${feylingData.feylingImg.replace('\\', '/')}`,
      feylingType: feylingData.feylingType,
    feylingAbility: feylingData.feylingAbility,
    feylingIsUnlocked: feylingData.feylingIsUnlocked,
    feylingHp: feylingData.feylingHp,
    feylingAtk: feylingData.feylingAtk,
    feylingItem: feylingData.feylingItem,
    feylingWeakAgainst: feylingData.feylingWeakAgainst,
    feylingStrongAgainst: feylingData.feylingStrongAgainst,
    feylingSellPrice: feylingData.feylingSellPrice,
  });

  const transformItem = (itemData: any): Item => ({
    itemId: itemData.itemId,
    itemName: itemData.itemName,
    itemDescription: itemData.itemDescription,
    itemImg: itemData.itemImg,
    itemAbility: itemData.itemAbility,
    itemRarity: itemData.itemRarity,
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
                  <div key={feyling.feylingId} className={styles.inventoryItem}>
                    <img src={feyling.feylingImg} alt={feyling.feylingName} className={styles.itemImage} />
                    <span className="feylingName">{feyling.feylingName}</span>
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
                  <div key={item.itemId} className={styles.inventoryItem}>
                    <img src={`${baseUrl}${item.itemImg}`} alt={item.itemName} className={styles.itemImage} />
                    <span className="itemName">{item.itemName}</span>
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
