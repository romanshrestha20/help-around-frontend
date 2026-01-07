import * as SecureStore from 'expo-secure-store';
import type { User } from './user.types';

async function saveUser(user: User): Promise<void> {
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
}

async function getUser(): Promise<User | null> {
    const userString = await SecureStore.getItemAsync('user_data');
    return userString ? (JSON.parse(userString) as User) : null;
}

async function clearUser(): Promise<void> {
    await SecureStore.deleteItemAsync('token');;
}

export { saveUser, getUser, clearUser };
