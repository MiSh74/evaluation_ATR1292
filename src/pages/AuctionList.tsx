import React, { useState } from 'react';
import { Select, Tag, notification, Button, Pagination } from 'antd';
import { PlusOutlined, ClockCircleOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auctionsApi } from '../api/auctions.api';
import styles from './AuctionList.module.css';

const { Option } = Select;

export const AuctionList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('');
    const navigate = useNavigate();
    const pageSize = 12;

    const { data, isLoading, error } = useQuery({
        queryKey: ['auctions', { page, status }],
        queryFn: () => {
            const params: any = { page, limit: pageSize };
            if (status) params.status = status;
            return auctionsApi.getAuctions(params);
        },
    });

    React.useEffect(() => {
        if (error) {
            notification.error({
                message: 'Failed to Load Auctions',
                description: (error as any).response?.data?.message || 'Unable to fetch auctions.',
            });
        }
    }, [error]);

    const auctions = data?.items || [];
    const total = data?.pagination?.total || 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'pending': return 'blue';
            case 'sold': return 'gold';
            case 'expired': return 'red';
            default: return 'default';
        }
    };

    const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

    const getTimeRemaining = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) return `${minutes}m left`;
        if (hours < 24) return `${hours}h ${minutes}m left`;

        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h left`;
    };

    const isEndingSoon = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();
        return diff > 0 && diff < 3600000; // Less than 1 hour
    };

    const getRandomGradient = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        ];
        return gradients[index % gradients.length];
    };

    // Loading Skeleton
    const renderSkeleton = () => (<div className={styles['skeleton-grid']}>
        {[...Array(6)].map((_, i) => (
            <div key={i} className={styles['skeleton-card']}>
                <div className={styles['skeleton-image']} />
                <div className={styles['skeleton-body']}>
                    <div className={styles['skeleton-line']} />
                    <div className={styles['skeleton-line']} />
                    <div className={`${styles['skeleton-line']} ${styles['skeleton-line-short']}`} />
                </div>
            </div>
        ))}
    </div>
    );

    return (
        <div className={styles['auction-list-container']}>
            <div className={styles['auction-list-header']}>
                <h1 className={styles['auction-list-title']}>
                    <TrophyOutlined /> Live Auctions
                </h1>
                <div className={styles['auction-list-controls']}>
                    <Select
                        className={styles['filter-select']}
                        value={status}
                        onChange={setStatus}
                        placeholder="Filter by status"
                        allowClear
                    >
                        <Option value="">All Statuses</Option>
                        <Option value="active">Active</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="sold">Sold</Option>
                        <Option value="expired">Expired</Option>
                    </Select>
                    <button
                        className={styles['create-auction-btn']}
                        onClick={() => navigate('/auctions/create')}
                    >
                        <PlusOutlined /> Create Auction
                    </button>
                </div>
            </div>

            {isLoading ? (
                renderSkeleton()
            ) : auctions.length === 0 ? (
                <div className={styles['empty-state']}>
                    <div className={styles['empty-state-icon']}>📦</div>
                    <h2 className={styles['empty-state-title']}>No Auctions Found</h2>
                    <p className={styles['empty-state-description']}>
                        {status ? 'Try changing your filter criteria' : 'Be the first to create an auction!'}
                    </p>
                    {!status && (
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/auctions/create')}
                        >
                            Create Your First Auction
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className={styles['auction-grid']}>
                        {auctions.map((auction, index) => (
                            <div
                                key={auction.id}
                                className={styles['auction-card']}
                                onClick={() => navigate(`/auctions/${auction.id}`)}
                            >
                                <div
                                    className={styles['auction-card-image']}
                                    style={{ background: getRandomGradient(index) }}
                                >
                                    <div className={styles['auction-card-image-placeholder']}>
                                        🏆
                                    </div>
                                </div>
                                <div className={styles['auction-card-body']}>
                                    <h3 className={styles['auction-card-title']}>
                                        {auction.title}
                                    </h3>
                                    <p className={styles['auction-card-description']}>
                                        {auction.description}
                                    </p>
                                    <div className={styles['auction-card-info']}>
                                        <div className={styles['auction-card-price']}>
                                            <span className={styles['auction-card-price-label']}>
                                                Current Bid
                                            </span>
                                            <span className={styles['auction-card-price-value']}>
                                                {formatPrice(auction.currentPrice)}
                                            </span>
                                        </div>
                                        <div className={styles['auction-card-status']}>
                                            <Tag color={getStatusColor(auction.status)}>
                                                {auction.status.toUpperCase()}
                                            </Tag>
                                        </div>
                                    </div>
                                    <div className={styles['auction-card-footer']}>
                                        <div
                                            className={`${styles['auction-card-timer']} ${isEndingSoon(auction.endsAt)
                                                    ? styles['auction-card-timer-urgent']
                                                    : ''
                                                }`}
                                        >
                                            {isEndingSoon(auction.endsAt) && <FireOutlined />}
                                            <ClockCircleOutlined />
                                            {getTimeRemaining(auction.endsAt)}
                                        </div>
                                        <div className={styles['auction-card-bids']}>
                                            💰 {auction.bids?.length || 0} bids
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles['auction-pagination']}>
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={pageSize}
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
