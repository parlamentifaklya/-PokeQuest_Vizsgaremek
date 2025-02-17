import React, { useState, useEffect, useRef } from 'react';
import { GetAllItems } from '../../../services/ApiServices';
import { Item } from '../../../types/Item';
import gsap from 'gsap';
import styles from './ItemChest.module.css';

interface ItemChestProps {
  isOpening: boolean;
  setIsOpening: React.Dispatch<React.SetStateAction<boolean>>;
}

const ItemChest = ({ isOpening, setIsOpening }: ItemChestProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [isItemSelected, setIsItemSelected] = useState<boolean>(false);
  const itemListRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await GetAllItems();
        setItems(shuffleArray(data)); // Shuffle items when setting state
      } catch (err) {
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Function to shuffle an array
  const shuffleArray = (array: Item[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  useEffect(() => {
    if (isOpening && itemListRef.current) {
      const totalItems = items.length;
      const itemWidth = 150; // The width of each item (adjust accordingly)
      const loopDuration = 2; // Duration for the loop

      // Create a looping GSAP animation for the items container
      animationRef.current = gsap.to(itemListRef.current, {
        x: `-=${itemWidth * totalItems}`, // Move the items container to the left by the total width of all items
        duration: loopDuration,
        repeat: -1, // Make it loop
        ease: "linear", // Smooth constant movement
      });

      // Automatically select an item after a certain duration
      const selectItemTimeout = setTimeout(() => {
        if (itemListRef.current) { // Check if itemListRef.current is not null
          // Calculate the index of the item under the indicator
          const indexUnderIndicator = Math.floor((itemListRef.current.offsetWidth / 2) / itemWidth);
          setSelectedItemIndex(indexUnderIndicator); // Select the item under the indicator

          // Stop the animation and set the position to the current position
          if (animationRef.current) {
            const currentX = gsap.getProperty(itemListRef.current, "x");
            gsap.set(itemListRef.current, { x: currentX }); // Set the current position
            animationRef.current.kill(); // Stop the animation
          }

          // Highlight the selected item
          setIsItemSelected(true); // Set item as selected
        }
      }, 3000); // Change this duration to control when the item is selected

      return () => {
        clearTimeout(selectItemTimeout);
        //if (animationRef.current) {
        //  animationRef.current.kill(); // causes problem with stopping the animation
        //}
      };
    }
  }, [isOpening, items]);

  if (loading) return <p>Loading items...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.itemChestOverlay}>
      <div className={styles.itemList} ref={itemListRef}>
        {items.map((item, index) => (
          <div
            className={styles.item}
            key={item.id}
            style={{
              background: index === selectedItemIndex ? 'yellow' : 'transparent', // Highlight selected item
            }}
          >
            <img src={item.img} alt={item.name} className={styles.itemImage} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
      <div className={styles.indicator}>
        ▼ {/* This is the indicator, you can customize it */}
      </div>
      {isItemSelected && ( // Option ally show something if an item is selected
        <p>Item Selected: {items[selectedItemIndex]?.name}</p>
      )}
    </div>
  );
};

export default ItemChest;