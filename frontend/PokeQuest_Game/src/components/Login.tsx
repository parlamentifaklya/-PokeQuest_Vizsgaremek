import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginData, GetInventory } from '../services/ApiServices';
import { decodeJWT } from '../services/TokenService'; // Import the decodeJWT function
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submit, setSubmit] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    if (submit) {
      const handleLogin = async () => {
        const payload = { email, password };
        try {
          console.log('Attempting login with:', payload);

          const data = await loginData("User/Login", payload);

          if (data && data.token) {
            // Decode the JWT token and store user info
            const decodedToken = decodeJWT(data.token);

            console.log("Decoded token header: ", decodedToken.header);
            console.log("Decoded token payload: ", decodedToken.payload);

            localStorage.setItem("authToken", data.token);

            // Store the decoded user data (e.g., username, level) in localStorage or state
            localStorage.setItem("userData", JSON.stringify(decodedToken.payload));

            console.log('Login successful, fetching inventory...');

            // Fetch user inventory after login
            const userId = decodedToken.payload.sub; // Assuming "sub" holds the user ID
            const inventoryData = await GetInventory(userId);

            // Store the inventory in localStorage
            localStorage.setItem("userInventory", JSON.stringify(inventoryData));

            console.log('Inventory fetched successfully:', inventoryData);
            navigate('/mainmenu');
          } else {
            setError('Invalid email or password!');
            console.error('Invalid response from server');
          }
        } catch (err) {
          setError('Login failed, please try again.');
          console.error('Error during login:', err);
        } finally {
          setSubmit(false);
        }
      };

      handleLogin();
    }
  }, [submit, email, password, navigate]);

  const handleButtonClick = () => {
    if (email && password) {
      setSubmit(true);
    } else {
      setError('Please enter both email and password.');
    }
  };

  return (
    <div className={styles.loginHolder}>
      <div className={styles.myForm}>
        <h2 className={styles.title}>Login</h2>

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          className={styles.inputField}
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          className={styles.inputField}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button className={styles.buttonTemp} type="button" onClick={handleButtonClick}>
          Login
        </button>

        <p className={styles.registerText}>
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
