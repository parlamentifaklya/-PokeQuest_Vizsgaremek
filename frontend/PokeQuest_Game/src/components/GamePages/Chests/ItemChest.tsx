import React, { useState, useRef, useEffect } from "react";
import "./ItemChest.css";
import { Link } from "react-router-dom";
import { Item } from "../../../types/Item";
import { GetAllItems } from "../../../services/ApiServices";

// Randomly select an item color (representing rarity)
const getItemColor = (rarity: number) => {
  switch (rarity) {
    case 0: return "grey";
    case 1: return "green";
    case 2: return "blue";
    case 3: return "purple";
    case 4: return "yellow";
    default: return "grey"; // Fallback color
  }
};

const ItemChest: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState("");
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Fetch items from the API and set the state
  const fetchItems = async () => {
    try {
      const fetchedItems = await GetAllItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Use effect to fetch items once the component is mounted
  useEffect(() => {
    fetchItems();
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
      setReward(`You have received a <strong>${selectedItem.name}</strong>!`);
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
              className={`item ${getItemColor(item.rarity)} ${isSpinning && item.id === selectedItem?.id ? "winning" : ""}`}
              style={{
                backgroundColor:
                  item.rarity === 0
                    ? "#808080" // Grey
                    : item.rarity === 1
                    ? "#32CD32" // Green
                    : item.rarity === 2
                    ? "#4682B4" // Blue
                    : item.rarity === 3
                    ? "#8A2BE2" // Purple
                    : "#FFD700", // Yellow
                width: "130px", // Ensure each item has consistent width
                height: "150px", // Increased height to give more space for text
                marginRight: "10px", // Spacing between items
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                textAlign: "center",
                padding: "10px",
                overflow: "hidden", // Prevent overflow
              }}
            >
              <img
                src={item.img}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "70%", // Reduce the image height to allow more space for text
                  objectFit: "contain",
                  marginBottom: "5px", // Small gap between image and text
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  color: "white",
                  wordWrap: "break-word", // Allow text to wrap
                  whiteSpace: "normal",  // Allow wrapping
                  overflow: "visible",    // Make sure all text is visible
                  padding: "0 5px",
                  height: "auto", // Allow height to expand as needed
                  flexGrow: 1,    // Ensure text area expands
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start", // Align text at the top
                }}
              >
                {item.name}
              </div>
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
          <div id="dialog-msg" dangerouslySetInnerHTML={{__html: reward}}></div>
          <Link to="/gamemenu">
            <button className="chest-open-button" onClick={handleDialogClose}>Close</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ItemChest;
