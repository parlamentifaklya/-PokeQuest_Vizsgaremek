import React, { useEffect, useState } from 'react';
import { UserInventory} from '../../../types/User';
import { Feyling } from '../../../types/Feyling';
import { Item } from '../../../types/Item';

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map the keys from localStorage to match the Feyling and Item types
  const transformFeyling = (feylingData: any): Feyling => ({
    id: feylingData.feylingId,
    name: feylingData.feylingName,
    description: feylingData.feylingDescription,
    img: feylingData.feylingImg,
    typeId: feylingData.feylingType,
    abilityId: feylingData.feylingAbility,
    isUnlocked: feylingData.feylingIsUnlocked,
    hp: feylingData.feylingHp,
    atk: feylingData.feylingAtk,
    itemId: feylingData.feylingItem,
    weakAgainstId: feylingData.feylingWeakAgainst,
    strongAgainstId: feylingData.feylingStrongAgainst,
    sellPrice: feylingData.feylingSellPrice
  });

  const transformItem = (itemData: any): Item => ({
    id: itemData.itemId,
    name: itemData.itemName,
    description: itemData.itemDescription,
    img: itemData.itemImg,
    itemAbility: itemData.itemAbility,
    rarity: itemData.itemRarity
  });

  useEffect(() => {
    const storedInventory = localStorage.getItem('userInventory');
    
    if (storedInventory) {
      const parsedInventory = JSON.parse(storedInventory);
      console.log(parsedInventory); // Check the structure of the data in localStorage

      // Transform the data to match the types
      const transformedInventory: UserInventory = {
        ownedFeylings: parsedInventory.ownedFeylings.map(transformFeyling),
        ownedItems: parsedInventory.ownedItems.map(transformItem)
      };

      setInventory(transformedInventory);  // Set inventory with the correct types
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
    <div>
      <h2>User Inventory</h2>
      
      {/* Owned Feylings Section */}
      <div>
        <h3>Owned Feylings</h3>
        <div className="inventory-list">
          {inventory.ownedFeylings.length === 0 ? (
            <p>No feylings owned</p>
          ) : (
            inventory.ownedFeylings.map((feyling) => (
              <div key={feyling.id} className="inventory-item">
                <img src={`http://localhost:5130/api/${feyling.img}`} alt={feyling.name} />
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Owned Items Section */}
      <div>
        <h3>Owned Items</h3>
        <div className="inventory-list">
          {inventory.ownedItems.length === 0 ? (
            <p>No items owned</p>
          ) : (
            inventory.ownedItems.map((item) => (
              <div key={item.id} className="inventory-item">
                <img src={`http://localhost:5130/api/${item.img}`} alt={item.name} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}  
export default Inventory;
