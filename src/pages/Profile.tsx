import React, { useState } from 'react';
import { Card, Typography, Button, Statistic, Row, Col } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { UserOutlined, WalletOutlined } from '@ant-design/icons';
import { AddFundsModal } from '../components/AddFundsModal';

const { Title, Text } = Typography;

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) return null;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>My Profile</Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card title="Account Details" bordered={false}>
                        <div style={{ marginBottom: 16 }}>
                            <UserOutlined style={{ fontSize: 24, marginRight: 8 }} />
                            <Text strong style={{ fontSize: 18 }}>{user.username}</Text>
                        </div>
                        <div>
                            <Text type="secondary">Email: </Text>
                            <Text>{user.email}</Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">User ID: </Text>
                            <Text code>{user.id}</Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Wallet Balance" bordered={false}>
                        <Statistic
                            title="Current Balance"
                            value={Number(user.balance)}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <Button
                            type="primary"
                            icon={<WalletOutlined />}
                            style={{ marginTop: 16 }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add Funds
                        </Button>
                    </Card>
                </Col>
            </Row>

            <AddFundsModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
