import { useNavigate } from "react-router-dom";
import styles from "./Button.module.css"

interface ButtonProps {
  text: string;
  route: string;
  onClick?: () => void;
  style?: React.CSSProperties; // Accepts inline styles
}

const Button: React.FC<ButtonProps> = ({ text, route, onClick, style }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    navigate(route);
  };

  return (
    <button className={styles.buttonstyle} onClick={handleClick} style={style}>
      {text}
    </button>
  );
}

export default Button;