import { useAuth } from "@/utils/authContext";
import { useRouter } from "expo-router";

export enum AuthContext {
  REQUIRED_ACTION = "REQUIRED_ACTION",
  ONBOARDING = "ONBOARDING",
  EXPLICIT_LOGIN = "EXPLICIT_LOGIN",
}

interface UseAuthPromptOptions {
  onSuccess?: () => void;
  onCancel?: () => void;
  context?: "cart" | "favorite" | "review" | "order";
}

export const useAuthPrompt = () => {
  const { isLoggedIn, toggleAuthModal } = useAuth();
  const router = useRouter();

  const requireAuth = (
    authContext: AuthContext,
    options?: UseAuthPromptOptions
  ): boolean => {
    if (isLoggedIn) {
      options?.onSuccess?.();
      return true;
    }

    switch (authContext) {
      case AuthContext.REQUIRED_ACTION:
        // Mostrar modal para acciones que requieren autenticación
        toggleAuthModal();
        break;

      case AuthContext.ONBOARDING:
      case AuthContext.EXPLICIT_LOGIN:
        // Redirigir a página completa
        router.push("/auth/signin");
        break;

      default:
        toggleAuthModal();
    }

    return false;
  };

  return { requireAuth, isLoggedIn };
};
