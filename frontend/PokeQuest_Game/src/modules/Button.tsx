import { useNavigate } from "react-router-dom";
import styles from "./Button.module.css";

interface ButtonProps {
  text: string;
  route?: string;  // Make the route prop optional
  onClick?: () => void;
  style?: React.CSSProperties; // Accepts inline styles
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, route, onClick, style, disabled }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick && !disabled) onClick();  // Prevent onClick if disabled
    if (!disabled && route) navigate(route);  // Only navigate if route is provided
  };

  return (
    <button 
      disabled={disabled}  // Apply the disabled attribute
      className={styles.buttonstyle} 
      onClick={handleClick} 
      style={{ ...style, cursor: disabled ? "not-allowed" : "pointer" }}  // Conditionally apply the cursor style
    >
      {text}
    </button>
  );
};

export default Button;
