import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import React from 'react';
import { toast } from 'sonner';

type QueryKeyItem = {
  queryKey: QueryKey | ((variables: any) => QueryKey);
  updateCache: (oldData: any, variables: any) => any;
};

interface ToastConfig {
  title?: string;
  description?: string;
  duration?: number;
}

interface MutationToastConfig {
  success?: ToastConfig | string | false;
  error?: ToastConfig | string | false;
  loading?: ToastConfig | string | false;
}

interface ToastVisibilityConfig {
  showSuccess?: boolean;
  showError?: boolean;
  showLoading?: boolean;
}

interface DebounceConfig {
  delay: number; // en milisegundos
  leading?: boolean; // si true, ejecuta inmediatamente y luego espera
}

const DEFAULT_MESSAGES: Record<'success' | 'error' | 'loading', ToastConfig> = {
  success: {
    title: '¡Éxito!',
    description: 'La operación se completó correctamente',
    duration: 3000,
  },
  error: {
    title: 'Error',
    description: 'Ocurrió un error. Por favor, inténtalo de nuevo',
    duration: 4000,
  },
  loading: {
    title: 'Cargando...',
    description: '',
    duration: undefined,
  },
};

function normalizeToastConfig(
  config?: ToastConfig | string | false, 
  defaultConfig?: ToastConfig
): ToastConfig | null {
  if (config === false) return null;
  if (config === undefined) return defaultConfig || null;
  
  if (typeof config === 'string') {
    return {
      ...defaultConfig,
      description: config,
    };
  }
  
  return {
    ...defaultConfig,
    ...config,
  };
}

function getToastMessage(config: ToastConfig): string {
  if (config.title && config.description) {
    return `${config.title}: ${config.description}`;
  }
  return config.description || config.title || '';
}

export function useOptimisticMutation<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown
>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;

  queries:
    | QueryKeyItem[]
    | QueryKeyItem
    | ((variables: TVariables) => QueryKeyItem[] | QueryKeyItem);

  queryKey?: QueryKey | ((variables: TVariables) => QueryKey);
  updateCache?: (oldData: any, variables: TVariables) => any;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables, context: TContext) => void;
  refetch?: () => void;
  
  showToasts?: boolean;
  toastConfig?: MutationToastConfig;
  toastVisibility?: ToastVisibilityConfig;
  
  debounce?: DebounceConfig;
  
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn" | "onMutate" | "onError" | "onSettled"
  >;
}) {
  const queryClient = useQueryClient();
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMutationRef = React.useRef<{
    variables: TVariables;
    context: any;
  } | null>(null);
  const [hasPendingMutation, setHasPendingMutation] = React.useState(false);
  
  const {
    mutationFn,
    queries,
    queryKey,
    updateCache,
    onSuccess,
    onMutate,
    onError,
    showToasts = true,
    toastConfig,
    toastVisibility = {
      showSuccess: false,
      showError: true,
      showLoading: false,
    },
    debounce,
    mutationOptions = {},
  } = options;

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const mutation = useMutation({
    mutationFn,
    ...mutationOptions,

    onMutate: async (variables: TVariables) => {
      // Normaliza las queries a un array de QueryKeyItem
      let queriesArray: QueryKeyItem[] = [];

      if (queryKey && updateCache) {
        queriesArray = [
          {
            queryKey,
            updateCache,
          },
        ];
      } else if (queries) {
        const queriesResult =
          typeof queries === "function" ? queries(variables) : queries;

        queriesArray = Array.isArray(queriesResult)
          ? queriesResult
          : [queriesResult];
      }

      if (queriesArray.length === 0) {
        console.warn(
          "useOptimisticMutation: No se proporcionaron queries válidas"
        );
        return {};
      }

      // Cancela las consultas en curso
      const cancelPromises = queriesArray.map((item) => {
        const currentQueryKey =
          typeof item.queryKey === "function"
            ? item.queryKey(variables)
            : item.queryKey;

        return queryClient.cancelQueries({ queryKey: currentQueryKey });
      });

      await Promise.all(cancelPromises);

      // Guarda los datos anteriores para cada query
      const previousDataMap = queriesArray.map((item) => {
        const currentQueryKey =
          typeof item.queryKey === "function"
            ? item.queryKey(variables)
            : item.queryKey;

        return {
          queryKey: currentQueryKey,
          previousData: queryClient.getQueryData(currentQueryKey),
        };
      });

      // Actualiza el caché optimísticamente
      queriesArray.forEach((item, index) => {
        const currentQueryKey = previousDataMap[index].queryKey;

        queryClient.setQueryData(currentQueryKey, (oldData: any) => {
          if (!oldData) return oldData;
          return item.updateCache(oldData, variables);
        });
      });

      if (onMutate) {
        onMutate(variables);
      }

      return { previousDataMap, queriesArray };
    },

    onSuccess: (data: TData, variables: TVariables) => {
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },

    onError: (_error, _variables, context: any) => {
      // Restaura los datos anteriores para cada query
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((item: any) => {
          if (item.previousData !== undefined) {
            queryClient.setQueryData(item.queryKey, item.previousData);
          }
        });
      }
      
      if (onError) {
        onError(_error, _variables, context);
      }
    },

    onSettled: (_data, _error, _variables, context: any) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((item: any) => {
          queryClient.invalidateQueries({
            queryKey: item.queryKey,
            refetchType: item.previousData !== undefined ? "none" : "all",
          });
        });
      }
    },
  });

  // Función auxiliar para ejecutar onMutate manualmente
  const executeOnMutate = React.useCallback(
    async (variables: TVariables) => {
      let queriesArray: QueryKeyItem[] = [];

      if (queryKey && updateCache) {
        queriesArray = [{ queryKey, updateCache }];
      } else if (queries) {
        const queriesResult = typeof queries === "function" ? queries(variables) : queries;
        queriesArray = Array.isArray(queriesResult) ? queriesResult : [queriesResult];
      }

      if (queriesArray.length === 0) return {};

      const cancelPromises = queriesArray.map((item) => {
        const currentQueryKey = typeof item.queryKey === "function" ? item.queryKey(variables) : item.queryKey;
        return queryClient.cancelQueries({ queryKey: currentQueryKey });
      });

      await Promise.all(cancelPromises);

      const previousDataMap = queriesArray.map((item) => {
        const currentQueryKey = typeof item.queryKey === "function" ? item.queryKey(variables) : item.queryKey;
        return {
          queryKey: currentQueryKey,
          previousData: queryClient.getQueryData(currentQueryKey),
        };
      });

      queriesArray.forEach((item, index) => {
        const currentQueryKey = previousDataMap[index].queryKey;
        queryClient.setQueryData(currentQueryKey, (oldData: any) => {
          if (!oldData) return oldData;
          return item.updateCache(oldData, variables);
        });
      });

      if (onMutate) {
        onMutate(variables);
      }

      return { previousDataMap, queriesArray };
    },
    [queryClient, queries, queryKey, updateCache, onMutate]
  );

  // Wrapper para manejar el debounce
  const debouncedMutate = React.useCallback(
    (variables: TVariables) => {
      // Si no hay debounce y no se muestran toasts, ejecuta normalmente
      if (!debounce && !showToasts) {
        mutation.mutate(variables);
        return;
      }

      // Si no hay debounce pero sí toasts, usa toast.promise
      if (!debounce && showToasts) {
        const shouldShowLoading = toastVisibility.showLoading && toastConfig?.loading !== false;
        const shouldShowSuccess = toastVisibility.showSuccess && toastConfig?.success !== false;
        const shouldShowError = toastVisibility.showError && toastConfig?.error !== false;

        // Si no se debe mostrar ningún toast, ejecuta sin promise
        if (!shouldShowLoading && !shouldShowSuccess && !shouldShowError) {
          mutation.mutate(variables);
          return;
        }

        // Configurar los mensajes del toast
        const loadingConfig = normalizeToastConfig(toastConfig?.loading, DEFAULT_MESSAGES.loading);
        const successConfig = normalizeToastConfig(toastConfig?.success, DEFAULT_MESSAGES.success);
        const errorConfig = normalizeToastConfig(toastConfig?.error, DEFAULT_MESSAGES.error);

        const promiseConfig: {
          loading?: string;
          success?: string | ((data: TData) => string);
          error?: string | ((error: TError) => string);
        } = {};

        if (shouldShowLoading && loadingConfig) {
          promiseConfig.loading = getToastMessage(loadingConfig);
        }
        if (shouldShowSuccess && successConfig) {
          promiseConfig.success = getToastMessage(successConfig);
        }
        if (shouldShowError && errorConfig) {
          promiseConfig.error = (error: TError) => {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            return errorConfig.description || errorMessage;
          };
        }

        toast.promise(
          mutation.mutateAsync(variables),
          promiseConfig
        );
        return;
      }

      // Limpia el timer anterior si existe
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Si es leading, ejecuta la actualización del caché inmediatamente
      if (debounce.leading) {
        executeOnMutate(variables).then((context) => {
          pendingMutationRef.current = { variables, context };
        });
      }

      // Programa la ejecución real de la mutación
      setHasPendingMutation(true);
      debounceTimerRef.current = setTimeout(() => {
        if (showToasts) {
          const shouldShowLoading = toastVisibility.showLoading && toastConfig?.loading !== false;
          const shouldShowSuccess = toastVisibility.showSuccess && toastConfig?.success !== false;
          const shouldShowError = toastVisibility.showError && toastConfig?.error !== false;

          if (shouldShowLoading || shouldShowSuccess || shouldShowError) {
            const loadingConfig = normalizeToastConfig(toastConfig?.loading, DEFAULT_MESSAGES.loading);
            const successConfig = normalizeToastConfig(toastConfig?.success, DEFAULT_MESSAGES.success);
            const errorConfig = normalizeToastConfig(toastConfig?.error, DEFAULT_MESSAGES.error);

            const promiseConfig: {
              loading?: string;
              success?: string | ((data: TData) => string);
              error?: string | ((error: TError) => string);
            } = {};

            if (shouldShowLoading && loadingConfig) {
              promiseConfig.loading = getToastMessage(loadingConfig);
            }
            if (shouldShowSuccess && successConfig) {
              promiseConfig.success = getToastMessage(successConfig);
            }
            if (shouldShowError && errorConfig) {
              promiseConfig.error = (error: TError) => {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                return errorConfig.description || errorMessage;
              };
            }

            toast.promise(
              mutation.mutateAsync(variables).finally(() => {
                pendingMutationRef.current = null;
                setHasPendingMutation(false);
              }),
              promiseConfig
            );
          } else {
            mutation.mutate(variables);
            pendingMutationRef.current = null;
            setHasPendingMutation(false);
          }
        } else {
          mutation.mutate(variables);
          pendingMutationRef.current = null;
          setHasPendingMutation(false);
        }
      }, debounce.delay);
    },
    [mutation, debounce, executeOnMutate, showToasts, toastConfig, toastVisibility]
  );

  const debouncedMutateAsync = React.useCallback(
    async (variables: TVariables): Promise<TData> => {
      // Si no hay debounce, ejecuta normalmente
      if (!debounce) {
        return mutation.mutateAsync(variables);
      }

      // Limpia el timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Si es leading, actualiza el caché inmediatamente
      if (debounce.leading) {
        const context = await executeOnMutate(variables);
        pendingMutationRef.current = { variables, context };
      }

      // Retorna una promesa que se resuelve después del debounce
      return new Promise((resolve, reject) => {
        setHasPendingMutation(true);
        debounceTimerRef.current = setTimeout(async () => {
          try {
            const result = await mutation.mutateAsync(variables);
            pendingMutationRef.current = null;
            setHasPendingMutation(false);
            resolve(result);
          } catch (error) {
            pendingMutationRef.current = null;
            setHasPendingMutation(false);
            reject(error);
          }
        }, debounce.delay);
      });
    },
    [mutation, debounce, executeOnMutate]
  );

  // Función para cancelar una mutación pendiente
  const cancelPendingMutation = React.useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      setHasPendingMutation(false);
    }

    // Si hay una mutación pendiente con leading=true, revertir los cambios
    if (pendingMutationRef.current?.context?.previousDataMap) {
      pendingMutationRef.current.context.previousDataMap.forEach((item: any) => {
        if (item.previousData !== undefined) {
          queryClient.setQueryData(item.queryKey, item.previousData);
        }
      });
    }

    pendingMutationRef.current = null;
  }, [queryClient]);

  return {
    ...mutation,
    mutate: debouncedMutate,
    mutateAsync: debouncedMutateAsync,
    cancelPendingMutation,
    isPending: mutation.isPending || hasPendingMutation,
  };
}