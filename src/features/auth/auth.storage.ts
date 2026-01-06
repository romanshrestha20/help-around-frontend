import * as SecureStore from 'expo-secure-store';
import { User } from './auth.types';

async function saveAuth(token: string, user: User): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
}

async function getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('auth_token');
}

async function getUser(): Promise<User | null> {
    const userString = await SecureStore.getItemAsync('auth_user');
    return userString ? (JSON.parse(userString) as User) : null;
}

async function clearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
}

export { saveAuth, getToken, getUser, clearAuth };