import React from 'react';
import { Descriptions, Typography, Tag } from 'antd';
import { formatDateTime } from '../utils/time';

const { Text } = Typography;

interface AuctionInfoProps {
    description: string;
    startingPrice: number;
    currentPrice: number;
    highestBidderUsername?: string;
    balance?: number;
    createdAt: string;
    endsAt: string;
    isEndingSoon: boolean;
}

const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

export const AuctionInfo: React.FC<AuctionInfoProps> = ({
    description,
    startingPrice,
    currentPrice,
    highestBidderUsername,
    balance,
    createdAt,
    endsAt,
    isEndingSoon
}) => {
    return (
        <Descriptions bordered column={1}>
            <Descriptions.Item label="Description">{description}</Descriptions.Item>
            <Descriptions.Item label="Starting Price">
                {formatPrice(startingPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Current Price">
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {formatPrice(currentPrice)}
                    {highestBidderUsername && (
                        <Tag style={{ marginLeft: 8 }} color="blue">
                            Highest Bid: {highestBidderUsername}
                        </Tag>
                    )}
                </Text>
            </Descriptions.Item>
            {balance !== undefined && (
                <Descriptions.Item label="Your Balance">
                    <Text strong style={{ color: '#52c41a' }}>
                        {formatPrice(balance)}
                    </Text>
                </Descriptions.Item>
            )}
            <Descriptions.Item label="Start Time">
                {formatDateTime(createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="End Time">
                <Text type={isEndingSoon ? 'danger' : undefined} strong={isEndingSoon}>
                    {formatDateTime(endsAt)}
                </Text>
            </Descriptions.Item>
        </Descriptions>
    );
};
