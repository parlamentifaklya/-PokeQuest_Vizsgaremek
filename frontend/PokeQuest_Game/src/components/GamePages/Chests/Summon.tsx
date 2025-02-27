import "./ItemChest.css";
import { Feyling } from "../../../types/Feyling";
import { GetAllFeylings } from "../../../services/ApiServices";
import Button from "../../../modules/Button";
import React, { useState, useEffect, useRef } from "react";

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
  const openCase = () => {
    if (isSpinning || openCaseDialog || loading) return; // Prevent re-triggering while spinning or dialog open and ensure feylings are loaded
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
      }, 2000); // Adjust timing to match the scroll duration
    }
  };

  // Handle dialog close and update inventory or coinAmount
  const handleDialogClose = () => {
    // Retrieve the userInventory and coinAmount from localStorage
    const storedUserInventory = JSON.parse(localStorage.getItem("userInventory") || "{}");
    const storedCoinAmount = JSON.parse(localStorage.getItem("CoinAmount") || "0");

    // Check if the selected feyling is already in the inventory
    const feylingAlreadyInInventory = storedUserInventory.ownedFeylings.some(
      (feyling: any) => feyling.feylingId === selectedFeyling?.id
    );

    if (feylingAlreadyInInventory) {
      // Increase CoinAmount if the feyling is already in the inventory
      const updatedCoinAmount = storedCoinAmount + (selectedFeyling?.sellPrice || 0); // Increase coin amount by sellPrice
      localStorage.setItem("CoinAmount", JSON.stringify(updatedCoinAmount)); // Save updated CoinAmount
    } else {
      // Add feyling to inventory if it's not already present
      const updatedUserInventory = { ...storedUserInventory };
      updatedUserInventory.ownedFeylings.push({
        feylingId: selectedFeyling?.id,
        feylingName: selectedFeyling?.name,
        feylingImg: selectedFeyling?.img,
        sellPrice: selectedFeyling?.sellPrice,
      });
      localStorage.setItem("userInventory", JSON.stringify(updatedUserInventory)); // Save updated inventory
    }

    // Close the dialog
    setOpenCaseDialog(false);
  };

  return (
    <div className="case-opening">
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
          <div id="dialog-msg" dangerouslySetInnerHTML={{ __html: reward }}></div>
          <Button style={{ width: "fit-content", fontSize:"35px" }} route="/gamemenu" text="Close" onClick={handleDialogClose} />
        </div>
      )}
    </div>
  );
};

export default Summon;
