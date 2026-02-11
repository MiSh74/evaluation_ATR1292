import React from 'react';
import { Card, List, Typography, Space } from 'antd';
import { formatDateTime } from '../utils/time';
import type { Bid } from '../types/auction';

const { Text } = Typography;

interface AuctionBidsProps {
    bids: Bid[];
}

const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

export const AuctionBids: React.FC<AuctionBidsProps> = ({ bids }) => {
    return (
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
    );
};
