import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, MailOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css'; // Reusing same styles

export const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await register({ email: values.email, password: values.password });
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
                        Join thousands of bidders in real-time auctions
                    </p>
                </div>
                <div className={styles['login-illustration']}>
                    🎯
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className={styles['login-right']}>
                <div className={styles['login-form-wrapper']}>
                    <div className={styles['login-card']}>
                        <h2 className={styles['login-card-title']}>Create Account</h2>
                        <p className={styles['login-card-subtitle']}>
                            Start bidding in seconds
                        </p>

                        <Form
                            name="register"
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
                                    prefix={<MailOutlined style={{ color: '#a0aec0' }} />}
                                    placeholder="Email address"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Please input your password!' },
                                    { min: 6, message: 'Password must be at least 6 characters!' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                                    placeholder="Password (6+ characters)"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Please confirm your password!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                                    placeholder="Confirm password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className={styles['login-submit-btn']}
                                >
                                    Create Account
                                </Button>
                            </Form.Item>

                            <div className={styles['login-footer']}>
                                Already have an account? <Link to="/login">Sign in</Link>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};
