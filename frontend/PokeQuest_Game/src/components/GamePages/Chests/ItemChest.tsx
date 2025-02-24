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

// Shuffle function to randomize the items array
const shuffleItems = (items: Item[]) => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]]; // Swap elements
  }
};

const ItemChest: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState("");
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true); // New state to track loading

  const itemWidth = 130; // Width of each item (this can be adjusted dynamically if needed)

  // Fetch items from the API and set the state
  const fetchItems = async () => {
    try {
      const fetchedItems = await GetAllItems();
      
      // Shuffle the items after fetching
      shuffleItems(fetchedItems);

      setItems(fetchedItems); // Set the shuffled items
      setLoading(false); // Set loading to false after items are fetched
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false); // Set loading to false even if there is an error
    }
  };

  // Use effect to fetch items once the component is mounted
  useEffect(() => {
    fetchItems();
  }, []);

  // Update the container width based on the number of items
  useEffect(() => {
    if (itemsContainerRef.current && items.length > 0) {
      // Using itemWidth to manually calculate max scroll
      const maxScroll = items.length * itemWidth;
      itemsContainerRef.current.style.width = `${maxScroll}px`; // Set the container width
    }
  }, [items]);

  // Open case function
  const openCase = () => {
    if (isSpinning || openCaseDialog || loading) return; // Prevent re-triggering while spinning or dialog open and ensure items are loaded
    setIsSpinning(true);

    // Ensure items are populated before continuing
    if (items.length === 0) {
      console.error("Items are not populated yet.");
      setIsSpinning(false);
      return;
    }

    // Exclude the first 5 and last 3 items for selection
    const eligibleItems = items.slice(5, items.length - 3);
    const randIndex = Math.floor(Math.random() * eligibleItems.length);
    const selectedItem = eligibleItems[randIndex];
    setSelectedItem(selectedItem);

    // Scroll to the selected item
    if (itemsContainerRef.current) {
      const containerWidth = 404.8; // Container width
      const itemWidth = 120; // Item width

      // Find the selected item's index in the full list
      const selectedIndex = items.indexOf(selectedItem);

      // Calculate the target position to scroll so the selected item is in the center
      const targetPosition = selectedIndex * itemWidth - (containerWidth - itemWidth) / 2;

      // Ensure the position doesn't exceed the maximum scrollable area
      const maxScroll = items.length * itemWidth - containerWidth;
      const snappedPosition = Math.min(Math.max(targetPosition, 0), maxScroll);

      // Apply smooth scrolling to the selected item
      itemsContainerRef.current.style.transition = `transform 2s ease-out`; // Smooth transition
      itemsContainerRef.current.style.transform = `translateX(-${snappedPosition}px)`; // Scroll to the target position

      // Wait for the scroll animation to finish, then show the selected item in the dialog
      setTimeout(() => {
        setReward(`You have received a <strong>${selectedItem.name}</strong>!`); // Show the reward for the item
        setOpenCaseDialog(true); // Open the dialog after scroll is done
        setIsSpinning(false); // End spinning
      }, 2000); // Adjust timing to match the scroll duration
    }
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
              className={`item ${getItemColor(item.rarity)} ${selectedItem && item.id === selectedItem.id ? "winning" : ""}`}
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
                width: `${itemWidth}px`, // Ensure each item has consistent width
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
        disabled={isSpinning || openCaseDialog || loading}
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
