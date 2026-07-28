import React from 'react';
import Toast from '../Toast/Toast';
import styles from './ToastContainer.module.css';
import { ToastContainerProps } from './ToastContainer.type'; // ✅ Import des types séparés

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;