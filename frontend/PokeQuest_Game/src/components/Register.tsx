import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerData } from '../services/ApiServices';
import styles from './Register.module.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Registration success state: ", registrationSuccess);
    if (registrationSuccess) {
      console.log("Navigating to login...");
      navigate('/login');
    }
  }, [registrationSuccess, navigate]);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      username,
      email,
      password,
    };

    try {
      const data = await registerData('User/Register', payload);
      console.log('API Response:', data);

      if (data && data.success) {
        console.log('User registered successfully!');
        setRegistrationSuccess(true);
      } else {
        setError(data.message || 'Registration failed, please try again.');
      }
    } catch (err) {
      setError('Error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    setIsSubmitting(true);
    handleRegister();
  };

  return (
    <div className={styles.registerHolder}>
      <div className={styles.myForm}>
        <h2 className={styles.title}>Register</h2>

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

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          className={styles.inputField}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button className={styles.buttonTemp} type="button" onClick={handleButtonClick} disabled={isSubmitting}>
          Register
        </button>

        <p className={styles.loginText}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
