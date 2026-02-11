import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from './socket';
import { useAuth } from '../auth/useAuth';

export interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (user && token) {
            const socketInstance = connectSocket(token);

            const onConnect = () => setIsConnected(true);
            const onDisconnect = () => setIsConnected(false);

            socketInstance.on('connect', onConnect);
            socketInstance.on('disconnect', onDisconnect);

            // Set initial state
            setIsConnected(socketInstance.connected);

            return () => {
                socketInstance.off('connect', onConnect);
                socketInstance.off('disconnect', onDisconnect);
            };
        } else {
            disconnectSocket();
            setIsConnected(false);
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket: getSocket(), isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
