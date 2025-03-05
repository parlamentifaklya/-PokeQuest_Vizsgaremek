import React, { createContext, useState, useContext, useEffect } from 'react';
import { FeylingsFromLocalStorage } from '../types/FeylingLocalStorage'; // Import your type

interface FeylingContextType {
  selectedFeyling: FeylingsFromLocalStorage | null;
  setSelectedFeyling: (feyling: FeylingsFromLocalStorage) => void;
  ownedFeylings: FeylingsFromLocalStorage[];
}

// Define the type for children
interface FeylingProviderProps {
  children: React.ReactNode; // Explicitly define the type for children
}

const FeylingContext = createContext<FeylingContextType | undefined>(undefined);

export const useFeyling = (): FeylingContextType => {
  const context = useContext(FeylingContext);
  if (!context) {
    throw new Error('useFeyling must be used within a FeylingProvider');
  }
  return context;
};

export const FeylingProvider: React.FC<FeylingProviderProps> = ({ children }) => { // Add children prop type
  const [selectedFeyling, setSelectedFeyling] = useState<FeylingsFromLocalStorage | null>(null);
  const [ownedFeylings, setOwnedFeylings] = useState<FeylingsFromLocalStorage[]>([]);

  useEffect(() => {
    const storedInventory = localStorage.getItem('userInventory');
    if (storedInventory) {
      const inventory = JSON.parse(storedInventory);
      setOwnedFeylings(inventory.ownedFeylings || []); // Load owned feylings from localStorage
    }
  }, []);

  return (
    <FeylingContext.Provider value={{ selectedFeyling, setSelectedFeyling, ownedFeylings }}>
      {children}
    </FeylingContext.Provider>
  );
};
