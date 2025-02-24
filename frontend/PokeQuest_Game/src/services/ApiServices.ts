import { Feyling } from "../types/Feyling";
import { Item } from "../types/Item";
import { Type } from "../types/Type";
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
