import React, { useState, useRef, useEffect } from "react";
import "./ItemChest.css";
import { Item } from "../../../types/Item";
import { GetAllItems, updateCoinAmount } from "../../../services/ApiServices";
import Button from "../../../modules/Button";
import { addItemToInventoryAndUpdateStorage } from "../../../services/ApiServices";
import Header from "../../../modules/Header";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom"; // Importing the navigate hook
import { text } from "framer-motion/client";

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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate(); // Initialize navigate hook

  const itemWidth = 130; // Width of each item
  const marginRight = 10; // Margin between items

  // Fetch items from the API and set the state
  const fetchItems = async () => {
    try {
      const fetchedItems = await GetAllItems();
      shuffleItems(fetchedItems);
      setItems(fetchedItems); // Set the shuffled items
      setLoading(false); // Set loading to false after items are fetched
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false); // Set loading to false even if there is an error
    }
  };

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Update container width based on the number of items
  useEffect(() => {
    if (itemsContainerRef.current && items.length > 0) {
      const maxScroll = items.length * (itemWidth + marginRight);
      itemsContainerRef.current.style.width = `${maxScroll}px`; // Set the container width
    }
  }, [items]);

  const openCase = async () => {
    if (isSpinning || openCaseDialog || loading) return;

    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");

    // Check if the user has enough coins to open the chest (50 coins)
    if (storedUserData.CoinAmount < 50) {
      toast.error("Not enough coins to open the chest! You need at least 50 coins.");
      return;
    }

    // Deduct 50 coins from the backend
    try {
      const response = await updateCoinAmount(storedUserData.sub, 50); // Deduct coins from the backend

      if (response?.newCoinAmount) {
        storedUserData.CoinAmount = response.newCoinAmount.toString();
        localStorage.setItem("userData", JSON.stringify(storedUserData)); // Update the localStorage with the new coin amount
      } else {
        toast.error("Failed to update coin amount on the backend.");
        return;
      }
    } catch (error) {
      console.error("Error deducting coins from the backend:", error);
      toast.error("Error deducting coins from the backend.");
      return;
    }

    setIsSpinning(true);

    if (items.length === 0) {
      console.error("Items are not populated yet.");
      setIsSpinning(false);
      return;
    }

    const eligibleItems = items.slice(5, items.length - 3);
    const randIndex = Math.floor(Math.random() * eligibleItems.length);
    const selectedItem = eligibleItems[randIndex];
    setSelectedItem(selectedItem);

    if (itemsContainerRef.current) {
      const containerWidth = 404.8;
      const itemWidthWithMargin = itemWidth + marginRight;

      const selectedIndex = items.indexOf(selectedItem);
      const targetPosition = selectedIndex * itemWidthWithMargin - (containerWidth - itemWidth) / 2;
      const maxScroll = items.length * itemWidthWithMargin - containerWidth;
      const snappedPosition = Math.min(Math.max(targetPosition, 0), maxScroll);

      itemsContainerRef.current.style.transition = `transform 2s ease-out`;
      itemsContainerRef.current.style.transform = `translateX(-${snappedPosition}px)`;

      setTimeout(() => {
        setReward(`You have received a <strong>${selectedItem.name}</strong>!`);
        setOpenCaseDialog(true);
        setIsSpinning(false);

        // Display the toast message with auto close and progress bar
        toast.success(`You received a ${selectedItem.name}!`, {
          autoClose: 3000, // Auto close after 3 seconds
          hideProgressBar: false, // Show the progress bar
          onClose: () => {
            // Once the toast closes, redirect to /gamemenu
            navigate("/gamemenu"); // Use navigate for SPA redirection
          },
        });

        // Add the item to the inventory and update localStorage
        const itemId = selectedItem.id;  // ID of the item the user received
        const amount = 1;  // Add 1 of the selected item

        // Add the item to the inventory and update localStorage
        addItemToInventoryAndUpdateStorage(itemId, amount);
      }, 2000);
    }
  };

  const handleDialogClose = () => {
    setOpenCaseDialog(false);
  };

  return (
    
    <div className="case-opening">
      <Header />
      
      <div className="window">
        <div className="indicator"></div>
        <div className="items-container" ref={itemsContainerRef}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`item ${getItemColor(item.rarity)} ${openCaseDialog && selectedItem && item.id === selectedItem.id ? "winning" : ""}`}
              style={{
                backgroundColor: item.rarity === 0 ? "#808080" : item.rarity === 1 ? "#32CD32" : item.rarity === 2 ? "#4682B4" : item.rarity === 3 ? "#8A2BE2" : "#FFD700",
                width: `${itemWidth}px`,
                height: "150px",
                marginRight: `${marginRight}px`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                textAlign: "center",
                padding: "10px",
                overflow: "hidden",
              }}
            >
              <img
                src={item.img}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "70%",
                  objectFit: "contain",
                  marginBottom: "5px",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  color: "white",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  overflow: "visible",
                  padding: "0 5px",
                  height: "auto",
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button style={{marginBottom: "2vh"}}
        onClick={openCase}
        disabled={isSpinning || openCaseDialog || loading}
        className="chest-open-button"
      >
        Open Case (50 gems)
      </button>

      <Button route="/gamemenu" text="Back"></Button>

      {/* Toast container */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Dialog to show the reward */}
      {openCaseDialog && (
        <div id="dialog" className="dialog">
          <div id="dialog-msg" dangerouslySetInnerHTML={{ __html: reward }}></div>
          <Button style={{ width: "fit-content", fontSize: "35px" }} route="/gamemenu" text="Close" onClick={handleDialogClose} />
        </div>
      )}
    </div>
  );
};

export default ItemChest;
