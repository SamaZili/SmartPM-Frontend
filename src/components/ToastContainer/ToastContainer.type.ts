export interface ToastItem {
  id: string | number;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string | number) => void;
}