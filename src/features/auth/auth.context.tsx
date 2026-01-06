import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

import { saveAuth, getToken, getUser, clearAuth } from "../auth/auth.storage";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  changePassword as changePasswordApi,
  getUser as getUserApi,
} from "./api/auth.api";
import {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/src/features/auth/auth.types";

import { useRouter } from "expo-router";

// Optional callback interfaces
export interface AuthActionOptions {
  onSuccess?: (user?: User) => void;
  onRedirect?: (path: string) => void;
  onFailure?: (message: string) => void;
}

// Define the shape of the context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload, options?: AuthActionOptions) => Promise<void>;
  signUp: (
    payload: RegisterPayload,
    options?: AuthActionOptions
  ) => Promise<void>;
  signOut: (options?: AuthActionOptions) => Promise<void>;
  changePassword: (
    payload: ChangePasswordPayload,
    options?: AuthActionOptions
  ) => Promise<void>;
}

// Create the context with default empty functions
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  changePassword: async () => {},
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Current user
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const router = useRouter();
  /**
   * Restore session on app start
   */
  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken(); // Get JWT from SecureStore
        if (!token) return; // No token, no session
        const frestoredUser = await getCurrentUser(); // Get user from SecureStore
        if (token && frestoredUser) {
          setUser(frestoredUser.user); // Restore session
        }
        await saveAuth(token, frestoredUser.user); // Refresh storage
      } catch (err) {
        console.error("Failed to restore session:", err);
        setError("Failed to restore session. Try again later"); // If storage fails
        await clearAuth(); // Clear storage
        setUser(null); // Clear user
        router.replace("/(auth)/login"); // Navigate to login
      } finally {
        setLoading(false); // Done restoring
      }
    };

    // Restore session on app start
    restoreSession();
  }, []);

  /**
   * Login user
   */
  const signIn = useCallback(
    async (payload: LoginPayload, options?: AuthActionOptions) => {
      setLoading(true);
      setError(null);

      try {
        const { token, user } = await loginApi(payload); // Call backend login
        await saveAuth(token, user); // Save token & user in SecureStore
        setUser(user); // Set user in context
        options?.onSuccess?.(user); // Call success callback
        options?.onRedirect?.("/(app)"); // Navigate to app
      } catch (err) {
        if (err instanceof Error) {
          options?.onFailure?.(err.message); // Call failure callback
          setError(err.message);
        } else {
          const msg =
            err instanceof Error
              ? err.message
              : "An unknown error occurred during login";
          setError(msg);
          options?.onFailure?.(msg); // Call failure callback
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Register user
   */
  const signUp = useCallback(
    async (payload: RegisterPayload, options?: AuthActionOptions) => {
      setLoading(true);
      setError(null);

      try {
        const { token, user } = await registerApi(payload); // Call backend register
        await saveAuth(token, user); // Save token & user
        setUser(user); // Set user
        options?.onSuccess?.(user); // Call success callback
        options?.onRedirect?.("/(app)"); // Navigate to app
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during registration";
        setError(message);
        options?.onFailure?.(message); // Call failure callback
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Logout user
   */
  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await logoutApi(); // Call backend logout
    } catch {
      console.warn("Server logout failed, clearing local session anyway");
    } finally {
      await clearAuth(); // Clear SecureStore
      setUser(null); // Clear context user
      setLoading(false);
      router.replace("/(auth)/login"); // Navigate to login
    }
  }, []);

  /**
   * Change user password
   */
  const changePassword = useCallback(
    async (payload: ChangePasswordPayload, options?: AuthActionOptions) => {
      setLoading(true);
      setError(null);

      try {
        await changePasswordApi(payload); // Call backend change password
        options?.onSuccess?.(); // Call success callback
        options?.onRedirect?.("/(app)"); // Navigate to app
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during password change";
        setError(message);
        options?.onFailure?.(message); // Call failure callback
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        changePassword,
        loading,
        error,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
