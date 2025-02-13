// Button.tsx
import React from 'react'
import styles from './Button.module.css'
import { useNavigate } from 'react-router-dom';

interface ButtonProps {
  text: string;
  route: string; 
}

const Button: React.FC<ButtonProps> = ({ text, route }) => {
  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate(route); 
  };

  return (
    <button className={styles.buttonstyle} onClick={handleClick}>
      {text}
    </button>
  );
}

export default Button;
