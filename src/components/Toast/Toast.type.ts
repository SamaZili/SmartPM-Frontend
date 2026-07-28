export interface ToastProps {
  id: string | number;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}