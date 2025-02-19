import React, { useState, useEffect, useRef } from 'react';
import './ItemChest.css';

// List of items to simulate
const items: string[] = [
  "asd",
  "asdd",
  "asddd",
  "asdddd",
  "asddddd",
  "asaddddd",
  "asddddddd",
  "asdddddddd"
];

// Constants
const ITEM_WIDTH = 120;  // Width of each item
const VISIBLE_ITEMS = 5;  // Number of items visible at once
const ANIMATION_DURATION = 5000;  // Animation duration in milliseconds (5 seconds)

const ItemChest: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]); // Store shuffled items here
  const [winningIndex, setWinningIndex] = useState<number | null>(null); // The winning item after animation stops
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null); // Invisible div for reference

  // Function to shuffle the items array
  const shuffleArray = (arr: string[]) => {
    let shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  };

  // Create a long array for infinite scrolling using the shuffled array
  const getLongArray = (repeatCount: number, shuffledArr: string[]) => {
    const longArray = [];
    for (let i = 0; i < repeatCount; i++) {
      longArray.push(...shuffledArr);
    }
    return longArray;
  };

  // Start spin logic
  const startSpin = (): void => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinningIndex(null);  // Reset previous winner

    // Shuffle the array once when the spin begins
    const shuffled = shuffleArray(items);
    const longShuffledItems = getLongArray(10, shuffled); // Simulate infinite scroll with 10 repetitions of the shuffled items array
    setShuffledItems(longShuffledItems);

    // Start the animation
    let startTime = performance.now();
    let totalTime = ANIMATION_DURATION;
    let velocity = 10;  // Initial speed of animation

    const animate = (timestamp: number) => {
      let elapsedTime = timestamp - startTime;

      if (elapsedTime < totalTime) {
        // Decelerate the animation as it progresses
        let velocityAdjustment = Math.max(velocity - (elapsedTime / totalTime) * velocity, 0);
        setPosition((prevPosition) => {
          return prevPosition - velocityAdjustment;
        });

        requestAnimationFrame(animate);  // Continue the animation
      } else {
        // Final stop after 5 seconds
        setPosition((prevPosition) => {
          // Get the position closest to the reference div's position
          const referenceDivPosition = targetRef.current?.getBoundingClientRect().left || 0;
          let closestItemIndex = 0;
          let minDistance = Infinity;

          shuffledItems.forEach((item, index) => {
            const itemPosition = ITEM_WIDTH * index;
            const distance = Math.abs(itemPosition - referenceDivPosition);

            if (distance < minDistance) {
              closestItemIndex = index;
              minDistance = distance;
            }
          });

          setWinningIndex(closestItemIndex);  // Set the winning index based on the closest item
          return prevPosition;
        });

        setIsSpinning(false);  // Stop the spinning after the animation finishes
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="case-opening">
      <div className="indicator" />
      <div className="window">
        <div
          className="items-container"
          ref={containerRef}
          style={{
            transform: `translateX(${position}px)`, // Apply dynamic position for scrolling
            display: 'flex',  // Use flexbox for horizontal layout
            transition: 'none', // Disable any CSS transitions to allow full control by JS
          }}
        >
          {shuffledItems.map((item, index) => (
            <div
              key={index}
              className={`item ${winningIndex === index ? 'winning' : ''}`}
              style={{
                width: ITEM_WIDTH,  // Set the width of each item
                flexShrink: 0,  // Prevent items from shrinking
              }}
            >
              {item}
            </div>
          ))}
        </div>
        {/* Invisible div to mark the center */}
        <div ref={targetRef} className="invisible-div" />
      </div>
      <button onClick={startSpin} disabled={isSpinning} className="chest-open-button">
        Open Case
      </button>
    </div>
  );
};

export default ItemChest;
