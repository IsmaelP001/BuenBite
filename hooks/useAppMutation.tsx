'use client'
import { toast } from "sonner";

import { useHttpApiClient } from "@/services/apiClient";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";

type ToastVariant = "solid" | "outline";
type ToastAction = "error" | "warning" | "success" | "info" | "muted";

interface ToastConfig {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
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

interface UseAppMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  > {
  invalidateQueries?: string[] | string;
  refetchQueries?: string[] | string;
  showToasts?: boolean;
  toastConfig?: MutationToastConfig;
  toastVisibility?: ToastVisibilityConfig;
}

const DEFAULT_MESSAGES: Record<"success" | "error" | "loading", ToastConfig> = {
  success: {
    title: "¡Éxito!",
    description: "La operación se completó correctamente",
    action: "success",
    variant: "solid",
    duration: 3000,
  },
  error: {
    title: "Error",
    description: "Ocurrió un error. Por favor, inténtalo de nuevo",
    action: "error",
    variant: "solid",
    duration: 4000,
  },
  loading: {
    title: "Cargando...",
    description: "",
    action: "info",
    variant: "solid",
    duration: undefined,
  },
};

function normalizeToastConfig(
  config?: ToastConfig | string | false,
  defaultConfig?: ToastConfig
): ToastConfig | null {
  if (config === false) return null;
  if (config === undefined) return defaultConfig || null;

  if (typeof config === "string") {
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

type MutationFn<TData, TVariables> = (
  variables: TVariables
) => Promise<TData>;

export function useAppMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: MutationFn<TData, TVariables>,
  options?: UseAppMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();

  const showToasts = options?.showToasts ?? true;
  const toastConfig = options?.toastConfig;
  const toastVisibility = options?.toastVisibility ?? {
    showSuccess: true,
    showError: true,
    showLoading: true,
  };

  const showToast = (config: ToastConfig) => {
    toast(config.title, {
      description: config.description,
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });
  };



  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onMutate: async (variables, mutationContext) => {
      if (
        showToasts &&
        toastVisibility.showLoading &&
        toastConfig?.loading !== false
      ) {
        const config = normalizeToastConfig(
          toastConfig?.loading,
          DEFAULT_MESSAGES.loading
        );
        if (config) {
          const id = showToast(config);
        }
      }

      if (options?.onMutate) {
        return await options.onMutate(variables, mutationContext);
      }

      return undefined as TContext;
    },
    onSuccess: async (data, variables, context, mutationContext) => {
      if (
        showToasts &&
        toastVisibility.showSuccess &&
        toastConfig?.success !== false
      ) {
        const config = normalizeToastConfig(
          toastConfig?.success,
          DEFAULT_MESSAGES.success
        );
        if (config) {
          showToast(config);
        }
      }

      if (options?.invalidateQueries) {
        const keys = Array.isArray(options.invalidateQueries)
          ? options.invalidateQueries
          : [options.invalidateQueries];

        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (options?.refetchQueries) {
        const keys = Array.isArray(options.refetchQueries)
          ? options.refetchQueries
          : [options.refetchQueries];

        keys.forEach((key) => {
          queryClient.refetchQueries({ queryKey: [key] });
        });
      }

      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context, mutationContext);
      }
    },
    onError: async (error, variables, context, mutationContext) => {
      if (
        showToasts &&
        toastVisibility.showError &&
        toastConfig?.error !== false
      ) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        const config = normalizeToastConfig(
          toastConfig?.error ?? errorMessage,
          DEFAULT_MESSAGES.error
        );
        if (config) {
          showToast(config);
        }
      }

      if (options?.onError) {
        await options.onError(error, variables, context, mutationContext);
      }
    },
    onSettled: options?.onSettled,
  });
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return React.useCallback(
    (keys: string[] | string) => {
      const queryKeys = Array.isArray(keys) ? keys : [keys];
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );
}
