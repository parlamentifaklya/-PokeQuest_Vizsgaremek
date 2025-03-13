import "./ItemChest.css";
import { Feyling } from "../../../types/Feyling";
import { addFeylingToInventory, GetAllFeylings, updateCoinAmount } from "../../../services/ApiServices"; // Import API services
import Button from "../../../modules/Button";
import React, { useState, useEffect, useRef } from "react";
import Header from "../../../modules/Header";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

// Shuffle function to randomize the feylings array
const shuffleFeylings = (feylings: Feyling[]) => {
  for (let i = feylings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [feylings[i], feylings[j]] = [feylings[j], feylings[i]]; // Swap elements
  }
};

const Summon: React.FC = () => {
  const [feylings, setFeylings] = useState<Feyling[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState("");
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const feylingsContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedFeyling, setSelectedFeyling] = useState<Feyling | null>(null);
  const [loading, setLoading] = useState(true); // New state to track loading

  const itemWidth = 130; // Width of each feyling (this can be adjusted dynamically if needed)
  const marginRight = 10; // Margin between feylings

  // Fetch feylings from the API and set the state
  const fetchFeylings = async () => {
    try {
      const fetchedFeylings = await GetAllFeylings();
      // Shuffle the feylings after fetching
      shuffleFeylings(fetchedFeylings);
      setFeylings(fetchedFeylings); // Set the shuffled feylings
      setLoading(false); // Set loading to false after feylings are fetched
    } catch (error) {
      console.error("Error fetching feylings:", error);
      setLoading(false); // Set loading to false even if there is an error
    }
  };

  // Use effect to fetch feylings once the component is mounted
  useEffect(() => {
    fetchFeylings();
  }, []);

  // Update the container width based on the number of feylings
  useEffect(() => {
    if (feylingsContainerRef.current && feylings.length > 0) {
      // Using itemWidth to manually calculate max scroll
      const maxScroll = feylings.length * (itemWidth + marginRight);
      feylingsContainerRef.current.style.width = `${maxScroll}px`; // Set the container width
    }
  }, [feylings]);

  // Open case function
  const openCase = async () => {
    if (isSpinning || openCaseDialog || loading) return; // Prevent re-triggering while spinning or dialog open and ensure feylings are loaded
    
    // Retrieve the user data from localStorage
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");

    // Check if the user has enough gems to open the chest
    if (storedUserData.CoinAmount < 100) {
      // Show a popup in the top-right corner if the user doesn't have enough gems
      showPopup("Not enough gems to open the chest! You need at least 100 gems.");
      return;
    }

    // Make the API call to deduct the gems from the backend
    try {
      const response = await updateCoinAmount(storedUserData.sub, 100); // Deduct 100 gems from the backend

      if (response?.newCoinAmount) {
        // Successfully deducted gems, update localStorage with the new coin amount
        storedUserData.CoinAmount = response.newCoinAmount.toString();
        localStorage.setItem("userData", JSON.stringify(storedUserData)); // Update the localStorage with the new coin amount
      } else {
        // If the response does not include new coin amount, show error
        showPopup("Failed to update gem amount on the backend.");
        return;
      }
    } catch (error) {
      console.error("Error deducting gems from the backend:", error);
      showPopup("Error deducting gems from the backend.");
      return;
    }

    setIsSpinning(true);

    // Ensure feylings are populated before continuing
    if (feylings.length === 0) {
      console.error("Feylings are not populated yet.");
      setIsSpinning(false);
      return;
    }

    // Exclude the first 5 and last 3 feylings for selection
    const eligibleFeylings = feylings.slice(5, feylings.length - 3);
    const randIndex = Math.floor(Math.random() * eligibleFeylings.length);
    const selectedFeyling = eligibleFeylings[randIndex];
    setSelectedFeyling(selectedFeyling);

    // Scroll to the selected item
    if (feylingsContainerRef.current) {
      const containerWidth = 404.8; // Container width
      const itemWidthWithMargin = itemWidth + marginRight; // Item width + margin between items

      // Find the selected item's index in the full list
      const selectedIndex = feylings.indexOf(selectedFeyling);

      // Calculate the target position to scroll so the selected item is in the center
      const targetPosition = selectedIndex * itemWidthWithMargin - (containerWidth - itemWidth) / 2;

      // Ensure the position doesn't exceed the maximum scrollable area
      const maxScroll = feylings.length * itemWidthWithMargin - containerWidth;
      const snappedPosition = Math.min(Math.max(targetPosition, 0), maxScroll);

      // Apply smooth scrolling to the selected item
      feylingsContainerRef.current.style.transition = `transform 2s ease-out`; // Smooth transition
      feylingsContainerRef.current.style.transform = `translateX(-${snappedPosition}px)`; // Scroll to the target position

      // Wait for the scroll animation to finish, then show the selected item in the dialog
      setTimeout(() => {
        setReward(`You have received a <strong>${selectedFeyling.name}</strong>!`); // Show the reward for the feyling
        setOpenCaseDialog(true); // Open the dialog after scroll is done
        setIsSpinning(false); // End spinning

        // Show toast notification
        toast.success(`You have received a ${selectedFeyling.name}!`, {
          onClose: () => {
            // Once the toast closes, return to /gamemenu
            window.location.href = "/gamemenu"; // Redirect to /gamemenu
          }
        });
      }, 2000); // Adjust timing to match the scroll duration
    }
  };

  // Handle dialog close and update inventory or coinAmount
  const handleDialogClose = async () => {
    // Retrieve the userInventory and CoinAmount separately from localStorage
    const storedUserInventory = JSON.parse(localStorage.getItem("userInventory") || "{}");
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");

    // Check if userInventory and CoinAmount are available
    if (!storedUserInventory || !storedUserData || !storedUserData.CoinAmount) {
      console.error("User inventory or Gem amount is not available.");
      setOpenCaseDialog(false);
      return;
    }

    const { CoinAmount } = storedUserData;

    // Convert CoinAmount to a number to handle it as a numeric value
    const coinAmountAsNumber = Number(CoinAmount);

    // Check if the selected feyling is already in the inventory
    const feylingAlreadyInInventory = storedUserInventory.ownedFeylings.some(
      (feyling: any) => feyling.feylingId === selectedFeyling?.id
    );

    if (feylingAlreadyInInventory) {
      // Increase CoinAmount by the sellPrice (convert to number)
      const updatedCoinAmount = coinAmountAsNumber + (selectedFeyling?.sellPrice || 0); // Add sellPrice as number
      storedUserData.CoinAmount = updatedCoinAmount.toString(); // Convert the number back to string before saving
    } else {
      // Add feyling to inventory if it's not already present
      storedUserInventory.ownedFeylings.push({
        feylingId: selectedFeyling?.id,
        feylingName: selectedFeyling?.name,
        feylingImg: selectedFeyling?.img,
        sellPrice: selectedFeyling?.sellPrice,
      });
    }

    // Save updated user inventory and userData back to localStorage
    localStorage.setItem("userInventory", JSON.stringify(storedUserInventory));
    localStorage.setItem("userData", JSON.stringify(storedUserData));

    // Send the updated data to the backend to persist the changes
    // Check if selectedFeyling exists and has a valid id before calling the API
    if (selectedFeyling && selectedFeyling.id !== undefined) {
      try {
        await addFeylingToInventory(storedUserData.sub, selectedFeyling.id); // Safe to use selectedFeyling.id now
        console.log("Successfully updated the backend with the new inventory and gem amount.");
      } catch (error) {
        console.error("Failed to update the backend:", error);
      }
    } else {
      console.error("Selected feyling is invalid.");
    }

    // Close the dialog
    setOpenCaseDialog(false);
  };

  // Function to show a popup notification
  const showPopup = (message: string) => {
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.innerText = message;
    document.body.appendChild(popup);

    // Remove the popup after 3 seconds
    setTimeout(() => {
      popup.remove();
    }, 3000);
  };

  return (
    <div className="case-opening">
      <Header />
      <div className="window">
        {/* Fixed indicator in the middle */}
        <div className="indicator"></div>
        <div className="items-container" ref={feylingsContainerRef}>
          {feylings.map((feyling, index) => (
            <div
              key={feyling.id}
              className={`item ${openCaseDialog && selectedFeyling && feyling.id === selectedFeyling.id ? "winning" : ""}`}
              style={{
                backgroundColor: "black",
                width: `${itemWidth}px`, // Ensure each item has consistent width
                height: "150px", // Increased height to give more space for text
                marginRight: `${marginRight}px`, // Spacing between items
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                textAlign: "center",
                padding: "10px",
                overflow: "hidden", // Prevent overflow
              }}
            >
              <img
                src={feyling.img}
                alt={feyling.name}
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
                {feyling.name}
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
        Open Chest (100 gems)
      </button>
      <Button route="/gamemenu" text="Back" disabled={isSpinning || openCaseDialog || loading}></Button>
      {openCaseDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <p dangerouslySetInnerHTML={{ __html: reward }} />
          </div>
        </div>
      )}
      <ToastContainer position="top-center" /> {/* Position the toast at the top-center */}
    </div>
  );
};

export default Summon;