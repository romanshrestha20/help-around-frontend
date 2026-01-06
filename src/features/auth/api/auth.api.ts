import apiClient from "@/src/shared/api/client.js";
import type {
    User,
    AuthResponse,
    ChangePasswordPayload,
    LoginPayload,
    RegisterPayload,
} from "../auth.types.js";


/**
 * Calls the backend login endpoint
 * @param data - { email, password }
 * @returns { token, user, message }
 */
export const login = async (data: LoginPayload): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        console.error(message);
        throw new Error(message)
    }
};

/**
 * Calls the backend register endpoint
 * @param data - { firstName, lastName, email, password }
 * @returns { token, user, message }
 */
export const register = async (data: RegisterPayload): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        console.error(message);
        throw new Error(message);
    }
};

/**
 * Calls the backend logout endpoint
 */
export const logout = async (): Promise<void> => {
    try {
        await apiClient.post('/auth/logout');
    } catch (error: any) {
        const message = error.response?.data?.message || 'Logout failed';
        console.error(message);
        throw new Error(message);
    }
};



/**
 * Calls the backend change password endpoint
 * @param data - { password, newPassword }
 * @returns { message }
 */
export const changePassword = async (data: ChangePasswordPayload): Promise<{}> => {
    try {
        const response = await apiClient.post('/auth/change-password', data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Change password failed';
        console.error(message);
        throw new Error(message);
    }
};


/**
 * Calls the backend get current user endpoint
 */

export const getCurrentUser = async (): Promise<{ user: User }> => {
    try {
        const response = await apiClient.get<{user: User}>('/auth/me');
        return response.data;   
    } catch (error: any) {
        const message = error.response?.data?.message || 'Get current user failed';
        console.error(message);
        throw new Error(message);
    }
};