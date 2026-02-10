import apiClient from './axios';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

export const authApi = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    addFunds: async (amount: number): Promise<{ balance: number }> => {
        const response = await apiClient.post<{ balance: number }>('/users/me/funds', { amount });
        return response.data;
    },
};
