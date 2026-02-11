import React, { useState } from 'react';
import { Tabs, Table, Tag, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { auctionsApi } from '../api/auctions.api';
import type { Auction, UserBid } from '../types/auction';

const { Title } = Typography;

export const MyAuctions: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('listings');

    // Fetch user listings
    const { data: listings, isLoading: isLoadingListings } = useQuery({
        queryKey: ['my-auctions', { userId: user?.id, type: 'listings' }],
        queryFn: () => auctionsApi.getUserAuctions({ limit: 100 }),
        enabled: !!user && activeTab === 'listings',
    });


    // Fetch auctions user has bid on
    const { data: bidsList, isLoading: isLoadingBids } = useQuery({
        queryKey: ['my-auctions', { userId: user?.id, type: 'bids' }],
        queryFn: () => auctionsApi.getUserBids({ limit: 100 }),
        enabled: !!user && activeTab === 'bids',
    });

    const auctionsData: Auction[] = listings?.items || [];
    const bidsData: UserBid[] = bidsList?.items || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'pending': return 'blue';
            case 'sold': return 'gold';
            case 'expired': return 'red';
            default: return 'default';
        }
    };

    const listingsColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Current Price',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (price: number) => `$${Number(price).toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: Auction) => (
                <Button size="small" onClick={() => navigate(`/auctions/${record.id}`)}>
                    View
                </Button>
            ),
        },
    ];

    const bidsColumns = [
        {
            title: 'Item Name',
            key: 'itemName',
            render: (_: unknown, record: UserBid) => record.auction.title,
        },
        {
            title: 'Price',
            dataIndex: 'amount',
            key: 'price',
            render: (amount: number) => `$${Number(amount).toFixed(2)}`,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: unknown, record: UserBid) => (
                <Tag color={getStatusColor(record.auction.status)}>{record.auction.status.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Won/Lose',
            key: 'result',
            render: (_: unknown, record: UserBid) => {
                if (record.auction.status !== 'sold' && record.auction.status !== 'expired') {
                    return <Tag>Ongoing</Tag>;
                }
                const isWinner = Number(record.amount) >= Number(record.auction.currentPrice);
                return isWinner ? <Tag color="success">WON</Tag> : <Tag color="error">LOST</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: UserBid) => (
                <Button size="small" onClick={() => navigate(`/auctions/${record.auction.id}`)}>
                    View
                </Button>
            ),
        },
    ];

    const items = [
        {
            key: 'listings',
            label: 'My Listings',
            children: (
                <Table
                    columns={listingsColumns}
                    dataSource={auctionsData}
                    rowKey="id"
                    loading={isLoadingListings}
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
        {
            key: 'bids',
            label: 'My Bids',
            children: (
                <Table
                    columns={bidsColumns}
                    dataSource={bidsData}
                    rowKey="id"
                    loading={isLoadingBids}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'You haven\'t placed any bids yet.' }}
                />
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>My Activity</Title>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        </div>
    );
};
