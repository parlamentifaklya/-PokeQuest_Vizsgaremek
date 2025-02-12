import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Default credentials
  const defaultUsername = "admin";
  const defaultPassword = "admin";

  const handleLogin = () => {
    if (username === defaultUsername && password === defaultPassword) {
      navigate('/mainmenu'); // Navigate to MainMenu
    } else {
      setError('Invalid username or password!');
    }
  };

  return (
    <div className={styles.loginHolder}>
      <div className={styles.myForm}>
        <h2 className={styles.title}>Login</h2>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          className={styles.inputField}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

        {error && <p className={styles.errorMessage}>{error}</p>} {/* Display error message if login fails */}

        <button className={styles.buttonTemp} type="button" onClick={handleLogin}>
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
