import React from 'react';
import styles from './Spinner.module.css';
import { SpinnerProps } from './Spinner.type'; // ✅ Import du type séparé

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color, className }) => {
  return (
    <div 
      className={`${styles.spinner} ${styles[size]} ${className || ''}`}
      style={color ? { borderTopColor: color } : undefined}
    >
    </div>
  );
};

export default Spinner;