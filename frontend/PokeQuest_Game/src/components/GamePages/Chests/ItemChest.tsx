import React, { useState, useRef, useEffect } from "react";
import "./ItemChest.css";
import { Link } from "react-router-dom";

// Define the type for an item
type Item = {
  id: number;
  rarity: string;
};

// Randomly select an item color (representing rarity)
const getItemColor = (rand: number) => {
  if (rand < 0.5) return "yellow";
  if (rand < 2) return "red";
  if (rand < 5) return "pink";
  if (rand < 20) return "purple";
  return "blue";
};

const ItemChest: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState("");
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Reset the items (simulating the case)
  const reset = () => {
    const newItems: Item[] = [];
    for (let i = 0; i < 500; i++) { // Generate 500 items
      const rand = Math.random() * 100;
      const rarity = getItemColor(rand);
      newItems.push({ id: i, rarity });
    }
    setItems(newItems);
  };

  // Use effect to ensure the items are populated once the component is mounted
  useEffect(() => {
    reset();
  }, []);

  // Open the case and animate
  const openCase = () => {
    if (isSpinning || openCaseDialog) return; // Prevent re-triggering while spinning or dialog open
    setIsSpinning(true);

    // Ensure items are populated before continuing
    if (items.length === 0) {
      console.error("Items are not populated yet.");
      setIsSpinning(false);
      return;
    }

    // Randomly select the winning item (ensure valid index)
    const rand = Math.floor(Math.random() * items.length);
    const selectedItem = items[rand];
    setSelectedItem(selectedItem);

    // Scroll the items horizontally to the selected item
    if (itemsContainerRef.current) {
      const itemWidth = 130; // Width of each item
      const containerWidth = itemsContainerRef.current.offsetWidth; // Width of the container
      const maxScroll = items.length * itemWidth; // Max scroll width

      // Calculate the target scroll position to center the selected item
      const targetScroll = rand * itemWidth - (containerWidth / 2) + (itemWidth / 2);

      // Ensure the container has enough width to display all items
      itemsContainerRef.current.style.width = `${maxScroll}px`;

      // Apply smooth scrolling transition with a slower animation (8s)
      itemsContainerRef.current.style.transition = `transform 8s ease-out`;
      itemsContainerRef.current.style.transform = `translateX(-${Math.min(Math.max(targetScroll, 0), maxScroll)}px)`; // Ensure it doesn't scroll past the end
    }

    // After the animation, show the reward
    setTimeout(() => {
      setReward(`You have received a ${selectedItem.rarity} item!`);
      setOpenCaseDialog(true);
      setIsSpinning(false);
    }, 8000); // Wait for the animation to finish
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenCaseDialog(false);
  };

  return (
    <div className="case-opening">
      <div className="window">
        {/* Fixed indicator in the middle */}
        <div className="indicator"></div>
        <div className="items-container" ref={itemsContainerRef}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`item ${item.rarity} ${isSpinning && item.id === selectedItem?.id ? "winning" : ""}`}
              style={{
                backgroundColor:
                  item.rarity === "yellow"
                    ? "#FFD700"
                    : item.rarity === "red"
                    ? "#FF0000"
                    : item.rarity === "pink"
                    ? "#FF1493"
                    : item.rarity === "purple"
                    ? "#800080"
                    : "#0000FF",
                width: "130px", // Ensure each item has consistent width
                height: "100px", // Height of the item
                marginRight: "10px", // Spacing between items
              }}
            >
              {item.rarity}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={openCase}
        disabled={isSpinning || openCaseDialog}
        className="chest-open-button"
      >
        Open Case
      </button>

      {/* Dialog to show the reward */}
      {openCaseDialog && (
        <div id="dialog" className="dialog">
          <div id="dialog-msg">{reward}</div>
          <Link to="/gamemenu">
            <button className="chest-open-button" onClick={handleDialogClose}>Close</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ItemChest;
