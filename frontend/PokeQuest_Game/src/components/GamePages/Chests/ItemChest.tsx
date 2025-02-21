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

  const itemWidth = 130; // Width of each item (this can be adjusted dynamically if needed)

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

  // Update the container width based on the number of items
  useEffect(() => {
    if (itemsContainerRef.current) {
      // Using itemWidth to manually calculate max scroll
      const maxScroll = items.length * itemWidth;
      itemsContainerRef.current.style.width = `${maxScroll}px`; // Set the container width
    }
  }, [items]);





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
  
    // Scroll the items horizontally to a random position first
    if (itemsContainerRef.current) {
      const containerWidth = 404.8; // Updated container width (from dev tools)
      const itemWidth = 120; // Updated item width (from dev tools)
  
      // Calculate the total width of all items
      const totalItemsWidth = items.length * itemWidth;
      const maxScroll = totalItemsWidth - containerWidth; // The maximum scrollable area
  
      // Randomly scroll within the max scroll range
      const randomScrollPosition = Math.floor(Math.random() * maxScroll);
  
      // Apply random scroll position
      itemsContainerRef.current.style.transition = `transform 4s ease-out`; // Smooth transition
      itemsContainerRef.current.style.transform = `translateX(-${randomScrollPosition}px)`; // Scroll to random position
    }
  
    // After scrolling animation ends, calculate the closest item to the center
    setTimeout(() => {
      if (itemsContainerRef.current) {
        const containerWidth = 404.8; // Container width
        const itemWidth = 120; // Item width
        const scrollPosition = Math.abs(parseFloat(itemsContainerRef.current.style.transform.replace('translateX(', '').replace('px)', ''))); // Current scroll position
        const middlePosition = scrollPosition + containerWidth / 2;
  
        // Find the closest item to the middle of the container
        let closestItemIndex = Math.floor(middlePosition / itemWidth);
  
        // Adjust if the scroll is closer to the next item
        if (middlePosition % itemWidth >= itemWidth / 2) {
          closestItemIndex++;
        }
  
        // Calculate the correct position for the closest item
        const targetItemIndex = closestItemIndex;
        const targetItemPosition = targetItemIndex * itemWidth - (containerWidth - itemWidth) / 2;
        const maxScroll = items.length * itemWidth - containerWidth;
  
        // Ensure we don't exceed max scroll
        let snappedPosition = Math.min(Math.max(targetItemPosition, 0), maxScroll);
  
        // Smoothly scroll to the correct position
        itemsContainerRef.current.style.transition = `transform 1s ease-out`; // Shorter transition for snap
        itemsContainerRef.current.style.transform = `translateX(-${snappedPosition}px)`; // Scroll to the snapped position
  
        // After the scroll ends, show the correct item in the dialog
        setTimeout(() => {
          let itemToShow;
  
          // If the random number is less than 9, show the actual snapped item
          if (rand < 9) {
            itemToShow = items[targetItemIndex]; // Show the snapped item
          } else {
            const previousItemIndex = Math.max(0, targetItemIndex - 1); // Get the previous item
            itemToShow = items[previousItemIndex]; // Show the previous item
          }
  
          setSelectedItem(itemToShow); // Show the correct item in the dialog
          setReward(`You have received a <strong>${itemToShow.name}</strong>!`); // Show the reward for the item
          setOpenCaseDialog(true); // Show the dialog only after snapping is done
          setIsSpinning(false); // End spinning
        }, 1000); // Wait for snap animation to finish before showing the dialog
      }
    }, 4000); // Adjust the timeout to match the first animation time (4s)
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
