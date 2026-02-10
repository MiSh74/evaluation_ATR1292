import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, List, Typography, Spin, Button, Space, Alert, notification } from 'antd';
import { EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { BidForm } from '../components/BidForm';
import { auctionsApi } from '../api/auctions.api';
import { getSocket } from '../sockets/socket';

import type {
    NewBidEvent,
    ViewerCountEvent,
} from '../types/socket';

const { Title, Text } = Typography;

export const AuctionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const [viewerCount, setViewerCount] = useState(0);
    const [isEndingSoon, setIsEndingSoon] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    // Fetch auction details using TanStack Query
    const { data: auction, isLoading: auctionLoading, error: auctionError } = useQuery({
        queryKey: ['auction', id],
        queryFn: () => auctionsApi.getAuctionById(id!),
        enabled: !!id,
    });

    // Fetch auction bids using TanStack Query
    const { data: bidsData, isLoading: bidsLoading } = useQuery({
        queryKey: ['auction-bids', id],
        queryFn: () => auctionsApi.getAuctionBids(id!, { limit: 20 }),
        enabled: !!id,
    });

    const loading = auctionLoading || bidsLoading;
    const bids = bidsData?.bids || [];

    // Show error notification when query fails
    React.useEffect(() => {
        if (auctionError) {
            notification.error({
                message: 'Failed to Load Auction',
                description: (auctionError as any).response?.data?.message || 'Unable to fetch auction details. Please try again.',
            });
        }
    }, [auctionError]);

    // WebSocket integration
    useEffect(() => {
        if (!id || !auction) return;

        const socket = getSocket();
        if (!socket) {
            console.warn('Socket not initialized despite user being logged in');
            return;
        }

        // Initialize connection state immediately
        setSocketConnected(socket.connected);

        console.log('🔌 Socket joining auction:', id);
        // Join the auction room using the correct event format
        socket.emit('join_auction', { auctionId: id });

        const handleConnect = () => {
            console.log('✅ Socket connected (in component)');
            setSocketConnected(true);
            // Re-join on reconnect
            socket.emit('join_auction', { auctionId: id });
            // Invalidate queries to refetch latest data
            queryClient.invalidateQueries({ queryKey: ['auction', id] });
            queryClient.invalidateQueries({ queryKey: ['auction-bids', id] });
        };

        const handleDisconnect = () => {
            console.log('❌ Socket disconnected (in component)');
            setSocketConnected(false);
        };

        // Handle NEW_BID event
        const handleNewBid = (event: NewBidEvent) => {
            console.log('🔥 NEW_BID received:', event);
            // Invalidate queries to refetch latest data
            queryClient.invalidateQueries({ queryKey: ['auction', id] });
            queryClient.invalidateQueries({ queryKey: ['auction-bids', id] });
            // Optionally refresh user balance if they might be outbid refund
            if (user) refreshUser();
        };

        const handleViewerCount = ({ count }: ViewerCountEvent) => {
            setViewerCount(count);
        };

        const handleEndingSoon = () => {
            setIsEndingSoon(true);
        };

        const handleAuctionSold = () => {
            queryClient.invalidateQueries({ queryKey: ['auction', id] });
            queryClient.invalidateQueries({ queryKey: ['auction-bids', id] });
            if (user) refreshUser();
        };

        const handleAuctionExpired = () => {
            queryClient.invalidateQueries({ queryKey: ['auction', id] });
            queryClient.invalidateQueries({ queryKey: ['auction-bids', id] });
        };

        // Attach listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('NEW_BID', handleNewBid);
        socket.on('VIEWER_COUNT', handleViewerCount);
        socket.on('AUCTION_ENDING_SOON', handleEndingSoon);
        socket.on('AUCTION_SOLD', handleAuctionSold);
        socket.on('AUCTION_EXPIRED', handleAuctionExpired);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('NEW_BID', handleNewBid);
            socket.off('VIEWER_COUNT', handleViewerCount);
            socket.off('AUCTION_ENDING_SOON', handleEndingSoon);
            socket.off('AUCTION_SOLD', handleAuctionSold);
            socket.off('AUCTION_EXPIRED', handleAuctionExpired);

            console.log('🔌 Socket leaving auction:', id);
            socket.emit('leave_auction', { auctionId: id });
        };
    }, [id, auction, queryClient]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!auction) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Alert
                    message="Auction Not Found"
                    description="The auction you're looking for doesn't exist or has been removed."
                    type="warning"
                    showIcon
                    action={
                        <Button onClick={() => navigate('/auctions')}>
                            Browse Auctions
                        </Button>
                    }
                />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'pending':
                return 'blue';
            case 'sold':
                return 'gold';
            case 'expired':
                return 'red';
            default:
                return 'default';
        }
    };

    const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const isBiddingDisabled = auction.status === 'sold' || auction.status === 'expired';

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/auctions')}>
                    Back to Auctions
                </Button>
            </Space>

            {isEndingSoon && auction.status === 'active' && (
                <Alert
                    message="Auction Ending Soon!"
                    description="This auction is about to end. Place your bids now!"
                    type="warning"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card
                title={
                    <Space>
                        <Title level={3} style={{ margin: 0 }}>
                            {auction.title}
                        </Title>
                        <Tag color={getStatusColor(auction.status)}>{auction.status.toUpperCase()}</Tag>
                    </Space>
                }
                extra={
                    <Space>
                        <Tag color={socketConnected ? 'success' : 'error'}>
                            {socketConnected ? 'LIVE' : 'OFFLINE'}
                        </Tag>
                        <EyeOutlined />
                        <Text>{viewerCount} viewers</Text>
                    </Space>
                }
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Description">{auction.description}</Descriptions.Item>
                    <Descriptions.Item label="Starting Price">
                        {formatPrice(auction.startingPrice)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Price">
                        <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                            {formatPrice(auction.currentPrice)}
                            {auction.highestBidderUsername && (
                                <Tag style={{ marginLeft: 8 }} color="blue">
                                    Highest Bid: {auction.highestBidderUsername}
                                </Tag>
                            )}
                        </Text>
                    </Descriptions.Item>
                    {user && (
                        <Descriptions.Item label="Your Balance">
                            <Text strong style={{ color: '#52c41a' }}>
                                {formatPrice(Number(user.balance))}
                            </Text>
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Start Time">
                        {formatDateTime(auction.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="End Time">
                        {formatDateTime(auction.endsAt)}
                    </Descriptions.Item>
                </Descriptions>

                {!isBiddingDisabled && auction.status === 'active' && user?.id !== auction.creator.id && (
                    <div style={{ marginTop: 24 }}>
                        <Title level={4}>Place a Bid</Title>
                        <BidForm
                            auctionId={auction.id}
                            currentPrice={auction.currentPrice}
                            minIncrement={auction.minimumBidIncrement}
                        />
                    </div>
                )}

                {user?.id === auction.creator.id && auction.status === 'active' && (
                    <Alert
                        message="You cannot bid on your own auction"
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                )}

                {isBiddingDisabled && (
                    <Alert
                        message={auction.status === 'sold' ? 'Auction Sold' : 'Auction Expired'}
                        description={
                            auction.status === 'sold'
                                ? `This auction has been sold to ${auction.highestBidderUsername || 'winner'} for ${formatPrice(auction.currentPrice)}.`
                                : 'This auction has expired without a sale.'
                        }
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                )}
            </Card>

            <Card title="Recent Bids (Last 20)" style={{ marginTop: 16 }}>
                {bids.length === 0 ? (
                    <Text type="secondary">No bids yet</Text>
                ) : (
                    <List
                        dataSource={bids}
                        renderItem={(bid) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text strong>{formatPrice(bid.amount)}</Text>
                                            <Text type="secondary">by {bid.username || bid.id}</Text>
                                        </Space>
                                    }
                                    description={formatDateTime(bid.createdAt)}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};
