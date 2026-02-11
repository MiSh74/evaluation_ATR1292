import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AuctionHeaderProps {
    title: string;
    status: string;
    viewerCount: number;
    isConnected: boolean;
    isEndingSoon: boolean;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'green';
        case 'pending': return 'blue';
        case 'sold': return 'gold';
        case 'expired': return 'red';
        default: return 'default';
    }
};

export const AuctionHeader: React.FC<AuctionHeaderProps> = ({
    title,
    status,
    viewerCount,
    isConnected,
    isEndingSoon
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
                <Title level={3} style={{ margin: 0 }}>{title}</Title>
                <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            </Space>
            <Space>
                <Tag color={isConnected ? 'success' : 'error'}>
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                </Tag>
                {isEndingSoon && status === 'active' && (
                    <Tag color="volcano" style={{ fontWeight: 'bold' }}>CLOSING SOON</Tag>
                )}
                <EyeOutlined />
                <Text>{viewerCount} viewers</Text>
            </Space>
        </div>
    );
};
