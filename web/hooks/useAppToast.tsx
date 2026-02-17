import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast';
import React from 'react';

type ToastVariant = 'solid' | 'outline';
type ToastAction = 'error' | 'warning' | 'success' | 'info' | 'muted';

interface ToastConfig {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

interface ShowToastOptions extends ToastConfig {
  id?: string;
}

export function useAppToast() {
  const toast = useToast();

  const showToast = React.useCallback((options: ShowToastOptions) => {
    const id = options.id || `toast-${Date.now()}-${Math.random()}`;
    
    toast.show({
      id,
      placement: 'top',
      duration: options.duration ?? 3000,
      render: ({ id }) => {
        const uniqueToastId = 'toast-' + id;
        return (
          <Toast 
            nativeID={uniqueToastId} 
            action={options.action || 'muted'} 
            variant={options.variant || 'outline'}
            className='rounded-2xl'
          >
            {options.title && <ToastTitle>{options.title}</ToastTitle>}
            {options.description && (
              <ToastDescription>{options.description}</ToastDescription>
            )}
          </Toast>
        );
      },
    });

    return id;
  }, [toast]);

  const success = React.useCallback((message: string | Omit<ShowToastOptions, 'action'>) => {
    const config = typeof message === 'string' 
      ? { description: message, title: '¡Éxito!' }
      : { title: '¡Éxito!', ...message };
    
    return showToast({
      ...config,
      action: 'success',
      variant: config.variant || 'solid',
      duration: config.duration ?? 3000,
    });
  }, [showToast]);

  const error = React.useCallback((message: string | Omit<ShowToastOptions, 'action'>) => {
    const config = typeof message === 'string' 
      ? { description: message, title: 'Error' }
      : { title: 'Error', ...message };
    
    return showToast({
      ...config,
      action: 'error',
      variant: config.variant || 'solid',
      duration: config.duration ?? 4000,
    });
  }, [showToast]);

  const warning = React.useCallback((message: string | Omit<ShowToastOptions, 'action'>) => {
    const config = typeof message === 'string' 
      ? { description: message, title: 'Advertencia' }
      : { title: 'Advertencia', ...message };
    
    return showToast({
      ...config,
      action: 'warning',
      variant: config.variant || 'solid',
      duration: config.duration ?? 3500,
    });
  }, [showToast]);

  const info = React.useCallback((message: string | Omit<ShowToastOptions, 'action'>) => {
    const config = typeof message === 'string' 
      ? { description: message, title: 'Información' }
      : { title: 'Información', ...message };
    
    return showToast({
      ...config,
      action: 'info',
      variant: config.variant || 'solid',
      duration: config.duration ?? 3000,
    });
  }, [showToast]);

  const loading = React.useCallback((message: string | Omit<ShowToastOptions, 'action'>) => {
    const config = typeof message === 'string' 
      ? { description: message, title: 'Cargando...' }
      : { title: 'Cargando...', ...message };
    
    return showToast({
      ...config,
      action: 'info',
      variant: config.variant || 'solid',
      duration: undefined, // No auto-dismiss
    });
  }, [showToast]);

  const close = React.useCallback((id: string) => {
    toast.close(id);
  }, [toast]);

  const closeAll = React.useCallback(() => {
    toast.closeAll();
  }, [toast]);

  return {
    show: showToast,
    success,
    error,
    warning,
    info,
    loading,
    close,
    closeAll,
  };
}