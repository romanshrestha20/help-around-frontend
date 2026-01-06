/**
 * User object returned by the backend
 */
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
}

/**
 * Response returned by login / register endpoints
 */
export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

/**
 * Data to send to login endpoint
 */
export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * Data to send to register endpoint
 */
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}


/** * Data to send to change password endpoint
 */
export interface ChangePasswordPayload {
    password: string;
    newPassword: string;
}