
import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

export const toast = {
  success: (title: string, options?: Omit<ToastProps, 'variant'>) => {
    return sonnerToast.success(title, options);
  },
  error: (title: string, options?: Omit<ToastProps, 'variant'>) => {
    return sonnerToast.error(title, options);
  },
  info: (title: string, options?: Omit<ToastProps, 'variant'>) => {
    return sonnerToast.info(title, options);
  },
  warning: (title: string, options?: Omit<ToastProps, 'variant'>) => {
    return sonnerToast.warning(title, options);
  },
  // Add custom method for compatibility
  custom: (props: ToastProps) => {
    if (props.variant === 'destructive') {
      return sonnerToast.error(props.title || '', { 
        description: props.description,
        duration: props.duration
      });
    }
    return sonnerToast(props.title || '', { 
      description: props.description,
      duration: props.duration
    });
  }
};

export const useToast = () => {
  return {
    toast
  };
};
