import apiClient from "@/src/shared/api/client.js";
import type { User } from "../user.types.js"


/**
 * Calls the backend get user by ID endpoint
 * @param userId - User ID
 * @returns { user }
 */
export const getUserById = async (userId: string): Promise<User> => {
    try {
        const response = await apiClient.get<{ user: User }>(`/users/${userId}`);
        return response.data.user;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to fetch user';
        console.error(message);
        throw new Error(message);
    }
};

/**
 * Calls the backend update user endpoint
 * @param userId - User ID
 * @param data - Partial user data to update
 * @returns { message, user }
 */
export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
    try {
        const response = await apiClient.put<{ user: User }>(`/users/${userId}`, data);
        return response.data.user;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to update user';
        console.error(message);
        throw new Error(message);
    }
};


/**
 * Calls the backend delete user endpoint
 * @param userId - User ID
 */

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await apiClient.delete(`/users/${userId}`);
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to delete user';
        console.error(message);
        throw new Error(message);
    }
};

/**
 * Calls the backend upload profile image endpoint
 * @param userId - User ID
 * @param imageData - FormData containing the image file
 * @returns { user }
 */
export const uploadProfileImage = async (
  userId: string,
  imageData: FormData
): Promise<User> => {
  try {
    const response = await apiClient.post<{ user: User }>(
      `/users/${userId}/upload`,
      imageData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data.user;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to upload profile image";
    throw new Error(message);
  }
};



/**
 * Calls the backend remove profile image endpoint
 * @param userId - User ID
 * @returns { user }
 */
export const removeProfileImage = async (userId: string): Promise<User> => {
    try {
        const response = await apiClient.delete<{ user: User }>(`/users/${userId}/remove`);
        return response.data.user;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to remove profile image';
        console.error(message);
        throw new Error(message);
    }
};

