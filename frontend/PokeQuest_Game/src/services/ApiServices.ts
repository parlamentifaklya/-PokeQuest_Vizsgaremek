import { Ability } from "../types/Ability";
import { Feyling } from "../types/Feyling";
import { Item } from "../types/Item";
import { Type } from "../types/Type";
import { User, UserInventory } from "../types/User";
//login
export const loginData = async (endpoint: string, payload: { email: string; password: string }) => {
  const BASE_URL = "http://localhost:5130/api/";

  try {
    const requestPayload = {
      email: payload.email,
      password: payload.password,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    // Log the response status and data
    console.log("Response Status:", response.status);
    const data = await response.json();
    console.log("Response Data:", data);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    if (data && data.token) {
      return data;  // Token is available, return the data
    }

    throw new Error('No token found in the response');
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};


//register
export const registerData = async (endpoint: string, payload: { username: string; email: string; password: string }) => {
  const BASE_URL = "http://localhost:5130/api/";
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error details:", errorData);
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Registration API Error:", error);
    throw error;
  }
};

export const GetAllItems = async (): Promise<Item[]> => {
  const BASE_URL = "http://localhost:5130/api/";  // Your API base URL, where items are fetched

  try {
    const response = await fetch(`${BASE_URL}Item/all`, {  // Correct endpoint for fetching items
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();  // Parse the response into JSON

    // Correct image URLs by checking for relative paths
    const itemsWithCorrectImages = data.map((item: Item) => {
      const imageUrl = item.img.startsWith("http") 
        ? item.img  // If it's already a full URL, use it
        : `http://localhost:5130/api/${item.img}`;  // Prepend only once

      return {
        ...item,
        img: imageUrl,  // Update the img URL
      };
    });

    return itemsWithCorrectImages;  // Return updated list of items
  } catch (error) {
    console.error("Error fetching items:", error);  // Log errors if any
    throw error;  // Rethrow error if necessary
  }
};

export const GetAllFeylings = async (): Promise<Feyling[]> => {
  const BASE_URL = "http://localhost:5130/api/";  // Your API base URL, where items are fetched

  try {
    const response = await fetch(`${BASE_URL}Feylings/GetAllFeylings`, {  // Correct endpoint for fetching items
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();  // Parse the response into JSON

    // Correct image URLs by checking for relative paths
    const itemsWithCorrectImages = data.map((feyling: Feyling) => {
      const imageUrl = feyling.img.startsWith("http") 
        ? feyling.img  // If it's already a full URL, use it
        : `http://localhost:5130/api/${feyling.img}`;  // Prepend only once

      return {
        ...feyling,
        img: imageUrl,  // Update the img URL
      };
    });

    return itemsWithCorrectImages;  // Return updated list of items
  } catch (error) {
    console.error("Error fetching feylings:", error);  // Log errors if any
    throw error;  // Rethrow error if necessary
  }
};


export const GetAllTypes = async (): Promise<Type[]> => {
  const BASE_URL = "http://localhost:5130/api/";  // Your API base URL, where items are fetched

  try {
    const response = await fetch(`${BASE_URL}Type/GetAllTypes`, {  // Correct endpoint for fetching items
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();  // Parse the response into JSON

    // Correct image URLs by checking for relative paths
    const itemsWithCorrectImages = data.map((type: Type) => {
      const imageUrl = type.img.startsWith("http") 
        ? type.img  // If it's already a full URL, use it
        : `http://localhost:5130/api/${type.img}`;  // Prepend only once

      return {
        ...type,
        img: imageUrl,  // Update the img URL
      };
    });

    return itemsWithCorrectImages;  // Return updated list of items
  } catch (error) {
    console.error("Error fetching types:", error);  // Log errors if any
    throw error;  // Rethrow error if necessary
  }
};


export const GetAllAbility = async (): Promise<Ability[]> => {
  const BASE_URL = "http://localhost:5130/api/";  // Your API base URL, where items are fetched

  try {
    const response = await fetch(`${BASE_URL}Ability/GetAllAbilities`, {  // Correct endpoint for fetching items
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();  // Parse the response into JSON

    // Correct image URLs by checking for relative paths
    const itemsWithCorrectImages = data.map((ability: Ability) => {
      const imageUrl = ability.img.startsWith("http") 
        ? ability.img  // If it's already a full URL, use it
        : `http://localhost:5130/api/${ability.img}`;  // Prepend only once

      return {
        ...ability,
        img: imageUrl,  // Update the img URL
      };
    });

    return itemsWithCorrectImages;  // Return updated list of items
  } catch (error) {
    console.error("Error fetching abilities:", error);  // Log errors if any
    throw error;  // Rethrow error if necessary
  }
};

export const GetInventory = async (userId: string): Promise<UserInventory> => {
  const BASE_URL = "http://localhost:5130/api/";

  try {
    const response = await fetch(`${BASE_URL}User/GetInventory/inventory/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Process ownedFeylings and ownedItems to ensure images have correct URLs
    const userInventory: UserInventory = {
      ownedFeylings: data.ownedFeylings.map((feyling: Feyling) => ({
        ...feyling,
        img: feyling.img && !feyling.img.startsWith("http")
          ? `${BASE_URL}${feyling.img}`  // Ensure the image has a complete URL
          : feyling.img,
      })),
      ownedItems: data.ownedItems.map((item: Item) => ({
        ...item,
        img: item.img && !item.img.startsWith("http")
          ? `${BASE_URL}${item.img}`  // Ensure the image has a complete URL
          : item.img,
      })),
    };

    return userInventory;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};


const addItemToInventory = async (userId: string, itemId: number, amount: number) => {
  try {
    // Ensure userId is a string before sending it
    const userIdString = String(userId);  // Convert userId to string if it's not already
    console.log(userId)
    const response = await fetch('http://localhost:5130/api/User/AddItemToInventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserId: userIdString, // Ensure it's a string
        ItemId: itemId,
        Amount: amount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details: ", errorData); // Log the full error details
      throw new Error(`API Error (AddItemToInventory): ${errorData.title || 'Unknown error'}`);
    }

    return await response.json(); // Return the response from the API if successful
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Caught Error:", error.message);
      throw new Error(`Error in addItemToInventory: ${error.message}`);
    } else {
      console.error("An unexpected error occurred:", error);
      throw new Error('An unexpected error occurred while adding item to inventory');
    }
  }
};

export const addItemToInventoryAndUpdateStorage = async (itemId: number, amount: number) => {
  try {
    // Retrieve UserId from localStorage
    const userId = JSON.parse(localStorage.getItem("userData") || "{}").sub;
    if (!userId) {
      console.error("UserId is not available.");
      return;
    }

    // Call the API to add the item
    await addItemToInventory(userId, itemId, amount);

    // Get the updated inventory from the server (or update it locally if needed)
    const updatedInventory = await GetInventory(userId);

    // Save the updated inventory in localStorage
    localStorage.setItem("userInventory", JSON.stringify(updatedInventory));
  } catch (error) {
    console.error("Error adding item to inventory and updating localStorage:", error);
  }
};

export const addFeylingToInventory = async (userId: string, feylingId: number): Promise<User> => {
  const apiBaseUrl = "http://localhost:5130"; 
  try {
    // Send the POST request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/api/User/AddFeylingToInventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserId: userId,
        FeylingId: feylingId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details: ", errorData);
      throw new Error(`API Error (AddFeylingToInventory): ${errorData.title || 'Unknown error'}`);
    }

    // Return the updated User data from the API if successful
    return await response.json(); // The response will return the updated User object
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Caught Error:", error.message);
      throw new Error(`Error in addFeylingToInventory: ${error.message}`);
    } else {
      console.error("An unexpected error occurred:", error);
      throw new Error('An unexpected error occurred while adding Feyling to inventory');
    }
  }
};

export const addFeylingToInventoryAndUpdateStorage = async (feylingId: number) => {
  try {
    // Retrieve UserId from localStorage
    const userId = JSON.parse(localStorage.getItem("userData") || "{}").sub;
    if (!userId) {
      console.error("UserId is not available.");
      return;
    }

    // Call the API to add the Feyling to the inventory
    const updatedUser: User = await addFeylingToInventory(userId, feylingId);
    
    // After getting the updated User, update the localStorage with the new User data
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    
    // Optionally, update user inventory in localStorage if needed (if you want it to be updated separately)
    localStorage.setItem("userInventory", JSON.stringify(updatedUser.userInventory));

  } catch (error) {
    console.error("Error adding Feyling to inventory and updating localStorage:", error);
  }
};

// Function to update coin amount on the backend using fetch
export const updateCoinAmount = async (userId: string, chestCost: number) => {
  const apiBaseUrl = "http://localhost:5130"; 
  try {
    const response = await fetch(`${apiBaseUrl}/api/User/UpdateCoinAmount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserId: userId,
        ChestCost: chestCost,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update coin amount');
    }

    const data = await response.json();

    // Return the response data
    return data;
  } catch (error) {
    console.error('Error updating coin amount:', error);
    throw new Error('Failed to update coin amount');
  }
};