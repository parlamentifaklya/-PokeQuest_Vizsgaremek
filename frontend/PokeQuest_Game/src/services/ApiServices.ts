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

export const GetAllItems = async () => {
  const BASE_URL = "http://localhost:5130/api/";  // Replace with your actual API base URL

  try {
    const response = await fetch(`${BASE_URL}Item/all`, {  // Replace 'items' with your API's actual endpoint
      method: 'GET',  // Use 'GET' to fetch data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();  // Parse the JSON response
    console.log('Fetched items:', data);  // Log or process the data

    return data;  // Return the fetched data (e.g., list of items)
  } catch (error) {
    console.error("Error fetching items:", error);  // Log errors if any
    throw error;  // Rethrow the error or handle it accordingly
  }
};