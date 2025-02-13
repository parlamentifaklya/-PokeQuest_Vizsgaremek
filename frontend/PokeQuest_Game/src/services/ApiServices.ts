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
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data);
      return data;
  
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  };

  
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
  
  export const getUser = async (endpoint: string, token: string) => {
    const BASE_URL = "http://localhost:5130/api/";
  
    try {
      console.log("Sending request with token:", token);
  
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const responseText = await response.text();
  
      if (!responseText) {
        throw new Error("Empty response body");
      }
  
      console.log("Raw Response from server:", responseText);

      const data = JSON.parse(responseText);
  
      return {
        username: data.userName,
        level: data.userLevel,
        gems: data.gems || 0,
        roles: data.roles || [],
      };
    } catch (error) {
      console.error("Get User API Error:", error);
      throw error;
    }
  };
  