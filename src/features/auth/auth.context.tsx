import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

import {
  saveAuth,
  getToken,
  clearAuth,
} from "@/src/features/auth/auth.storage";

import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  changePassword as changePasswordApi,
  getCurrentUser,
} from "@/src/features/auth/api";
import {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/src/features/auth/auth.types";

// Navigation is handled by consumers via callbacks

// Optional callback interfaces
export interface AuthActionOptions {
  onSuccess?: (user?: User) => void;
  onRedirect?: (path: string) => void;
  onFailure?: (message: string) => void;
}

// Define the shape of the context
export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
  setUser: () => {},
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

  /**
   * Restore session on app start
   * data: {}
   * @returns void
   */
  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken(); // Get JWT from SecureStore
        if (!token) return; // No token, no session
        const storedUser = await getCurrentUser(); // Get user from SecureStore
        if (token && storedUser) {
          setUser(storedUser.user); // Restore session
        }
        await saveAuth(token, storedUser.user); // Refresh storage
      } catch (err) {
        console.error("Failed to restore session:", err);
        setError("Failed to restore session. Try again later"); // If storage fails
        await clearAuth(); // Clear storage
        setUser(null); // Clear user
        // Consumers may redirect on failure via UI handlers
      } finally {
        setLoading(false); // Done restoring
      }
    };

    // Restore session on app start
    restoreSession();
  }, []);

  /**
   * Login user
   * data: { email, password }
   * @params options - Callbacks for success, failure, and redirection
   * @returns void
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
   * @params payload - Registration data
   * data: { firstName, lastName, email, password }
   * @params options - Callbacks for success, failure, and redirection
   * @returns void
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
   * data: {}
   * @params options - Callbacks for success, failure, and redirection
   * @returns void
   */
  const signOut = useCallback(async (options?: AuthActionOptions) => {
    setLoading(true);

    try {
      await logoutApi(); // Call backend logout
    } catch {
      console.warn("Server logout failed, clearing local session anyway");
    } finally {
      await clearAuth(); // Clear SecureStore
      setUser(null); // Clear context user
      setLoading(false);
      options?.onRedirect?.("/(auth)/login"); // Navigate to login via callback
    }
  }, []);

  /**
   * Change user password
   * data: { password, newPassword }
   * @params options - Callbacks for success, failure, and redirection
   * @returns void
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
        setUser,
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

