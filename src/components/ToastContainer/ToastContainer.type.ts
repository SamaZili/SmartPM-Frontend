export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}