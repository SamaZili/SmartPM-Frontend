import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color = '#10b981' }) => {
  return (
    <div 
      className={`${styles.spinner} ${styles[size]}`} 
      style={{ borderTopColor: color }}
    />
  );
};

export default Spinner;