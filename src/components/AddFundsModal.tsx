import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, Space, notification, Typography } from 'antd';
import { PlusCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuth } from '../auth/useAuth';
import { AxiosError } from 'axios';

const { Text } = Typography;

interface AddFundsModalProps {
    open: boolean;
    onClose: () => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const { refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState<number>(50);

    const mutation = useMutation({
        mutationFn: (val: number) => authApi.addFunds(val),
        onSuccess: async () => {
            notification.success({
                message: 'Funds Added',
                description: 'Your account balance has been updated successfully.',
            });
            await refreshUser();
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            form.resetFields();
            onClose();
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            notification.error({
                message: 'Failed to Add Funds',
                description: axiosError.response?.data?.message || 'Something went wrong. Please try again.',
            });
        },
    });

    const onFinish = (values: { amount: number }) => {
        mutation.mutate(values.amount);
    };

    const quickAmounts = [10, 50, 100, 500];

    return (
        <Modal
            title={
                <Space>
                    <WalletOutlined />
                    <span>Add Funds to Account</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <div style={{ padding: '20px 0' }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ amount: 50 }}
                >
                    <Form.Item
                        name="amount"
                        label="Enter Amount"
                        rules={[
                            { required: true, message: 'Please enter an amount' },
                            { type: 'number', min: 1, message: 'Minimum amount is $1.00' }
                        ]}
                    >
                        <InputNumber
                            prefix="$"
                            style={{ width: '100%' }}
                            size="large"
                            precision={2}
                            onChange={(val) => setAmount(Number(val) || 0)}
                        />
                    </Form.Item>

                    <div style={{ marginBottom: 24 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                            Quick Select:
                        </Text>
                        <Space wrap>
                            {quickAmounts.map((amt) => (
                                <Button
                                    key={amt}
                                    onClick={() => form.setFieldsValue({ amount: amt })}
                                    type={amount === amt ? 'primary' : 'default'}
                                >
                                    +${amt}
                                </Button>
                            ))}
                        </Space>
                    </div>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<PlusCircleOutlined />}
                                loading={mutation.isPending}
                            >
                                Add Funds
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};
