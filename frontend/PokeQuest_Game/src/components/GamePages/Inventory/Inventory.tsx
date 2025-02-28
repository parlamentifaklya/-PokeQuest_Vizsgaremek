import React, { useEffect, useState } from 'react';
import { UserInventory } from '../../../types/User';
import { Feyling } from '../../../types/Feyling';
import { Item } from '../../../types/Item';
import styles from './Inventory.module.css';  // Import the styles
import Header from '../../../modules/Header';
import Button from '../../../modules/Button';

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = 'http://localhost:5130/api/';  // Add the base URL for the images

  

  const transformFeyling = (feylingData: any): Feyling => ({
    id: feylingData.feylingId,
    name: feylingData.feylingName,
    description: feylingData.feylingDescription,
    img: feylingData.feylingImg.startsWith('http') 
      ? feylingData.feylingImg  // If the image already contains a full URL, use it directly
      : `${baseUrl}${feylingData.feylingImg.replace('\\', '/')}`,  // Otherwise, prepend base URL
    typeId: feylingData.feylingType,
    abilityId: feylingData.feylingAbility,
    isUnlocked: feylingData.feylingIsUnlocked,
    hp: feylingData.feylingHp,
    atk: feylingData.feylingAtk,
    itemId: feylingData.feylingItem,
    weakAgainstId: feylingData.feylingWeakAgainst,
    strongAgainstId: feylingData.feylingStrongAgainst,
    sellPrice: feylingData.feylingSellPrice,
  });

  const transformItem = (itemData: any): Item => ({
    id: itemData.itemId,
    name: itemData.itemName,
    description: itemData.itemDescription,
    img: itemData.itemImg,
    itemAbility: itemData.itemAbility,
    rarity: itemData.itemRarity,
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

      {/* Feylings Section */}
      <div className={styles.section}>
        <h3>Owned Feylings</h3>
        <div className={styles.inventoryList}>
          {inventory.ownedFeylings.length === 0 ? (
            <p>No feylings owned</p>
          ) : (
            inventory.ownedFeylings.map((feyling) => (
              <div key={feyling.id} className={styles.inventoryItem}>
                {/* Use the transformed image URL */}
                <img src={feyling.img} alt={feyling.name} className={styles.itemImage} />
                <span className='feylingName'>{feyling.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className={styles.section}>
        <h3>Owned Items</h3>
        <div className={styles.inventoryList}>
          {inventory.ownedItems.length === 0 ? (
            <p>No items owned</p>
          ) : (
            inventory.ownedItems.map((item) => (
              <div key={item.id} className={styles.inventoryItem}>
                {/* Ensure the image URL is complete */}
                <img src={`${baseUrl}${item.img}`} alt={item.name} className={styles.itemImage} />
                <span className='itemName'>{item.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <Button style={{ marginTop: "1vh" }} route="/gamemenu" text="Back"></Button>
    </div>
  );
};

export default Inventory;
