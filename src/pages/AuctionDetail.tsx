import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, Space, Alert, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { BidForm } from '../components/BidForm';
import { AuctionHeader } from '../components/AuctionHeader';
import { AuctionInfo } from '../components/AuctionInfo';
import { AuctionBids } from '../components/AuctionBids';
import { auctionsApi } from '../api/auctions.api';
import { useAuctionSocket } from '../hooks/useAuctionSocket';

export const AuctionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    // Fetch auction details
    const { data: auction, isLoading: auctionLoading, error: auctionError } = useQuery({
        queryKey: ['auction', id],
        queryFn: () => auctionsApi.getAuctionById(id!),
        enabled: !!id,
    });

    // Fetch auction bids
    const { data: bidsData, isLoading: bidsLoading } = useQuery({
        queryKey: ['auction-bids', id],
        queryFn: () => auctionsApi.getAuctionBids(id!, { limit: 20 }),
        enabled: !!id,
    });

    const { isConnected, viewerCount, isEndingSoon } = useAuctionSocket(id, auction?.title);

    const loading = auctionLoading || bidsLoading;
    const bids = bidsData?.bids || [];

    // Show error notification when query fails
    useEffect(() => {
        if (auctionError) {
            notification.error({
                message: 'Failed to Load Auction',
                description: (auctionError as any).response?.data?.message || 'Unable to fetch auction details. Please try again.',
            });
        }
    }, [auctionError]);

    // Refresh user balance if they might be outbid refund
    // In a real app, this might be better handled by a dedicated socket event for balance
    useEffect(() => {
        if (user && bids.length > 0) {
            refreshUser();
        }
    }, [bids.length, user, refreshUser]);

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

            <Card>
                <AuctionHeader
                    title={auction.title}
                    status={auction.status}
                    viewerCount={viewerCount}
                    isConnected={isConnected}
                    isEndingSoon={isEndingSoon}
                />

                <AuctionInfo
                    description={auction.description}
                    startingPrice={auction.startingPrice}
                    currentPrice={auction.currentPrice}
                    highestBidderUsername={auction.highestBidderUsername}
                    balance={user?.balance ? Number(user.balance) : undefined}
                    createdAt={auction.createdAt}
                    endsAt={auction.endsAt}
                    isEndingSoon={isEndingSoon}
                />

                {!isBiddingDisabled && auction.status === 'active' && user?.id !== auction.creator.id && (
                    <div style={{ marginTop: 24 }}>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Place a Bid</h4>
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
                                ? `This auction has been sold to ${auction.highestBidderUsername || 'winner'} for $${Number(auction.currentPrice).toFixed(2)}.`
                                : 'This auction has expired without a sale.'
                        }
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                )}
            </Card>

            <AuctionBids bids={bids} />
        </div>
    );
};
