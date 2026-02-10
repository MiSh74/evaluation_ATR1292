import type { Auction } from './auction';

export interface User {
    id: string;
    email: string;
    username: string;
    balance: string | number;
    wonAuctions?: Auction[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}
