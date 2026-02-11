import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../sockets/useSocket';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import type {
    NewBidEvent,
    ViewerCountEvent,
    AuctionEndingSoonEvent,
    AuctionSoldEvent,
    AuctionExpiredEvent
} from '../types/socket';

export const useAuctionSocket = (auctionId: string | undefined, auctionTitle?: string) => {
    const { socket, isConnected } = useSocket();
    const queryClient = useQueryClient();
    const [viewerCount, setViewerCount] = useState(0);
    const [isEndingSoon, setIsEndingSoon] = useState(false);

    const handleNewBid = useCallback((event: NewBidEvent) => {
        console.log('🔥 NEW_BID received:', event);
        queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
        queryClient.invalidateQueries({ queryKey: ['auction-bids', auctionId] });
    }, [auctionId, queryClient]);

    const handleViewerCount = useCallback(({ count }: ViewerCountEvent) => {
        setViewerCount(count);
    }, []);

    const handleEndingSoon = useCallback((data: AuctionEndingSoonEvent) => {
        console.log(`🔔 Auction ${data.auctionId} ending soon!`);
        setIsEndingSoon(true);
        notification.warning({
            message: 'Auction Ending Soon!',
            description: `Auction "${auctionTitle || auctionId}" ends in 5 minutes! Place your final bids now.`,
            duration: 10,
            placement: 'topRight',
        });
    }, [auctionId, auctionTitle]);

    const handleAuctionSold = useCallback((data: AuctionSoldEvent) => {
        console.log(`💰 Auction ${data.auctionId} SOLD!`);
        queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
        queryClient.invalidateQueries({ queryKey: ['auction-bids', auctionId] });
        notification.success({
            message: 'Auction Sold!',
            description: `Item sold to ${data.winnerName} for $${data.finalPrice.toFixed(2)}`,
        });
    }, [auctionId, queryClient]);

    const handleAuctionExpired = useCallback((data: AuctionExpiredEvent) => {
        console.log(`⏳ Auction ${data.auctionId} expired.`);
        queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
        notification.info({
            message: 'Auction Expired',
            description: 'The auction has ended without a sale.',
        });
    }, [auctionId, queryClient]);

    useEffect(() => {
        if (!socket || !auctionId) return;

        // Join room
        socket.emit('join_auction', { auctionId });

        // Event listeners
        socket.on('NEW_BID', handleNewBid);
        socket.on('VIEWER_COUNT', handleViewerCount);
        socket.on('AUCTION_ENDING_SOON', handleEndingSoon);
        socket.on('AUCTION_SOLD', handleAuctionSold);
        socket.on('AUCTION_EXPIRED', handleAuctionExpired);

        // Re-join on reconnect
        const onConnect = () => {
            socket.emit('join_auction', { auctionId });
            queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
            queryClient.invalidateQueries({ queryKey: ['auction-bids', auctionId] });
        };
        socket.on('connect', onConnect);

        return () => {
            socket.emit('leave_auction', { auctionId });
            socket.off('NEW_BID', handleNewBid);
            socket.off('VIEWER_COUNT', handleViewerCount);
            socket.off('AUCTION_ENDING_SOON', handleEndingSoon);
            socket.off('AUCTION_SOLD', handleAuctionSold);
            socket.off('AUCTION_EXPIRED', handleAuctionExpired);
            socket.off('connect', onConnect);
        };
    }, [socket, auctionId, handleNewBid, handleViewerCount, handleEndingSoon, handleAuctionSold, handleAuctionExpired, queryClient]);

    return {
        isConnected,
        viewerCount,
        isEndingSoon,
    };
};
