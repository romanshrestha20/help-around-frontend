import axios from 'axios';
import { getToken } from "@/src/features/auth/auth.storage";
import {ENV} from "../config/env"

const apiClient = axios.create({
    baseURL: ENV.API_BASE_URL, // Replace with your backend URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;