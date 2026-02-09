import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await login(values);
            navigate('/');
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['login-container']}>
            {/* Left Side - Gradient Background */}
            <div className={styles['login-left']}>
                <div className={styles['login-brand']}>
                    <h1 className={styles['login-brand-title']}>
                        <ThunderboltOutlined /> LiveBid
                    </h1>
                    <p className={styles['login-brand-subtitle']}>
                        Real-time auction platform where every bid counts
                    </p>
                </div>
                <div className={styles['login-illustration']}>
                    🏆
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={styles['login-right']}>
                <div className={styles['login-form-wrapper']}>
                    <div className={styles['login-card']}>
                        <h2 className={styles['login-card-title']}>Welcome Back</h2>
                        <p className={styles['login-card-subtitle']}>
                            Sign in to continue bidding
                        </p>

                        <Form
                            name="login"
                            onFinish={onFinish}
                            className={styles['login-form']}
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
                                    placeholder="Email address"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                                    placeholder="Password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className={styles['login-submit-btn']}
                                >
                                    Sign In
                                </Button>
                            </Form.Item>

                            <div className={styles['login-footer']}>
                                Don't have an account? <Link to="/register">Create one now</Link>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};
