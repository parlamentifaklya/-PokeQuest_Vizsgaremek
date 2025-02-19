import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import'./ItemChest.css';
import { div } from 'framer-motion/client';

const items: string[] = [
  "asd",
  "asdd",
  "asddd",
  "asdddd",
  "asddddd",
  "asaddddd",
  "asddddddd",
  "asdddddddd"
]

const ITEM_WIDTH = 120;
const ANIMATION_SPEED = 5;
const VISIBLE_ITEMS = 5;
const TOTAL__ITEMS = items.length * 2;

const ItemChest: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [position, SetPosition] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animation: number | undefined;

    if (isSpinning) {
      animation = window.setInterval(() => {
        SetPosition((prev) => prev - ANIMATION_SPEED);
      }, 10) 
    }
    else if (!isSpinning && winningIndex !== null) {
      if (animation !== undefined) {
        clearInterval(animation);
      }
    }

    return () => {
      if (animation !== undefined) {
        clearInterval(animation);
      }
    }
  }, [isSpinning, winningIndex])

  const StartSpin = (): void => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinningIndex(null);

    setTimeout(() => {
      const chosenIndex = Math.floor(Math.random() * items.length);
      setWinningIndex(chosenIndex);

      const finalOffset = -(chosenIndex * ITEM_WIDTH) + Math.floor(VISIBLE_ITEMS / 2) * ITEM_WIDTH;
      SetPosition(finalOffset);

      setTimeout(() => {
        setIsSpinning(false)
      }, 3000);
    }, 2000);
  };
  
  return (
    <div className='case-opening'>
      <div className='indicator' />
      <div className='window'>
        <motion.div className='items-container'
        ref={containerRef}
        animate={{x: position}}
        transition={{ease: "easeOut", duration: isSpinning ? 0 : 3}}>
          {items.concat(items).map((item, index) => (
            <div key={index} className={`item ${winningIndex === index % items.length ? "winning" : ""}`}>
              {item}
            </div>
          ))}
        </motion.div>
      </div>
      <button onClick={StartSpin} disabled={isSpinning}>Open Case</button>
    </div>
  );
};

export default ItemChest;