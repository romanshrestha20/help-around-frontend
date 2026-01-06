import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

import {
  getUserById as getUserByIdApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  uploadProfileImage as uploadProfileImageApi,
  removeProfileImage as removeProfileImageApi,
} from "./api/user.api.js";

import {
  User,
  UpdateUserPayload,
  UploadProfileImagePayload,
} from "./user.types.js";

import { useAuth } from "../auth/hooks/use-auth.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface UserActionOptions {
  onSuccess?: (user?: User) => void;
  onRedirect?: (path: string) => void;
  onFailure?: (message: string) => void;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  getUser: (userId: string, options?: UserActionOptions) => Promise<void>;
  updateUser: (
    userId: string,
    data: UpdateUserPayload,
    options?: UserActionOptions
  ) => Promise<void>;
  deleteUserAccount: (
    userId: string,
    options?: UserActionOptions
  ) => Promise<void>;
  changeProfileImage: (
    userId: string,
    imageData: UploadProfileImagePayload,
    options?: UserActionOptions
  ) => Promise<void>;
  removeProfileImage: (
    userId: string,
    options?: UserActionOptions
  ) => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  error: null,
  getUser: async () => {},
  updateUser: async () => {},
  deleteUserAccount: async () => {},
  changeProfileImage: async () => {},
  removeProfileImage: async () => {},
});

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Get user                                                                 */
  /* ------------------------------------------------------------------------ */

  const getUser = useCallback(
    async (userId: string, options?: UserActionOptions) => {
      setLoading(true);
      setError(null);

      try {
        const fetchedUser = await getUserByIdApi(userId);
        setUserData(fetchedUser);
        options?.onSuccess?.(fetchedUser);
      } catch (err: any) {
        const message = err?.message ?? "Failed to fetch user";
        setUserData(null);
        setError(message);
        options?.onFailure?.(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ------------------------------------------------------------------------ */
  /* Update user                                                              */
  /* ------------------------------------------------------------------------ */

  const updateUser = useCallback(
    async (
      userId: string,
      data: UpdateUserPayload,
      options?: UserActionOptions
    ) => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await updateUserApi(userId, data);
        setUserData(updatedUser);

        if (authUser?.id === updatedUser.id) {
          setAuthUser(updatedUser);
        }

        options?.onSuccess?.(updatedUser);
      } catch (err: any) {
        const message = err?.message ?? "Failed to update user";
        setError(message);
        options?.onFailure?.(message);
      } finally {
        setLoading(false);
      }
    },
    [authUser, setAuthUser]
  );

  /* ------------------------------------------------------------------------ */
  /* Delete user                                                              */
  /* ------------------------------------------------------------------------ */

  const deleteUserAccount = useCallback(
    async (userId: string, options?: UserActionOptions) => {
      setLoading(true);
      setError(null);

      try {
        await deleteUserApi(userId);
        setUserData(null);

        if (authUser?.id === userId) {
          setAuthUser(null);
        }

        options?.onSuccess?.();
        options?.onRedirect?.("/(auth)/login");
      } catch (err: any) {
        const message = err?.message ?? "Failed to delete user";
        setError(message);
        options?.onFailure?.(message);
      } finally {
        setLoading(false);
      }
    },
    [authUser, setAuthUser]
  );

  /* ------------------------------------------------------------------------ */
  /* Change profile image                                                     */
  /* ------------------------------------------------------------------------ */

  const changeProfileImage = useCallback(
    async (
      userId: string,
      payload: UploadProfileImagePayload,
      options?: UserActionOptions
    ) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("image", payload.image);

        const result = await uploadProfileImageApi(userId, formData);

        setUserData((prev) =>
          prev ? { ...prev, imageUrl: result.imageUrl } : prev
        );

        if (authUser?.id === userId) {
          setAuthUser((prev: any) =>
            prev ? { ...prev, imageUrl: result.imageUrl } : prev
          );
        }

        options?.onSuccess?.();
      } catch (err: any) {
        const message = err?.message ?? "Failed to upload profile image";
        setError(message);
        options?.onFailure?.(message);
      } finally {
        setLoading(false);
      }
    },
    [authUser, setAuthUser]
  );

  /* ------------------------------------------------------------------------ */
  /* Remove profile image                                                     */
  /* ------------------------------------------------------------------------ */

  const removeProfileImage = useCallback(
    async (userId: string, options?: UserActionOptions) => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await removeProfileImageApi(userId);
        setUserData(updatedUser);

        if (authUser?.id === updatedUser.id) {
          setAuthUser(updatedUser);
        }

        options?.onSuccess?.(updatedUser);
      } catch (err: any) {
        const message = err?.message ?? "Failed to remove profile image";
        setError(message);
        options?.onFailure?.(message);
      } finally {
        setLoading(false);
      }
    },
    [authUser, setAuthUser]
  );

  /* ------------------------------------------------------------------------ */
  /* Sync with auth user                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (authUser) {
      getUser(authUser.id);
    } else {
      setUserData(null);
    }
  }, [authUser, getUser]);

  /* ------------------------------------------------------------------------ */
  /* Provider                                                                 */
  /* ------------------------------------------------------------------------ */

  return (
    <UserContext.Provider
      value={{
        user: userData,
        loading,
        error,
        getUser,
        updateUser,
        deleteUserAccount,
        changeProfileImage,
        removeProfileImage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
