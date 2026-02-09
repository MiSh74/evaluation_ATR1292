import React from 'react';
import { Layout } from 'antd';
import { LogoutOutlined, ThunderboltOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './AppLayout.module.css';

const { Content } = Layout;

export const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <Layout className={styles['app-layout']}>
            <header className={styles['app-header']}>
                <div className={styles['app-header-left']}>
                    <div className={styles['app-brand']} onClick={() => navigate('/auctions')}>
                        <ThunderboltOutlined className={styles['app-brand-icon']} />
                        <span className={styles['app-brand-text']}>LiveBid</span>
                    </div>

                    <nav className={styles['app-nav']}>
                        <button
                            className={`${styles['app-nav-item']} ${isActive('/auctions') ? styles['app-nav-item-active'] : ''}`}
                            onClick={() => navigate('/auctions')}
                        >
                            Auctions
                        </button>
                        <button
                            className={`${styles['app-nav-item']} ${isActive('/my-auctions') ? styles['app-nav-item-active'] : ''}`}
                            onClick={() => navigate('/my-auctions')}
                        >
                            My Auctions
                        </button>
                        <button
                            className={`${styles['app-nav-item']} ${isActive('/auctions/create') ? styles['app-nav-item-active'] : ''}`}
                            onClick={() => navigate('/auctions/create')}
                        >
                            Create Auction
                        </button>
                    </nav>
                </div>

                <div className={styles['app-header-right']}>
                    <div className={styles['balance-display']} onClick={() => navigate('/profile')}>
                        <WalletOutlined className={styles['balance-icon']} />
                        <span className={styles['balance-amount']}>
                            ${parseFloat(user?.balance || '0').toFixed(2)}
                        </span>
                    </div>

                    <div className={styles['user-menu']} onClick={() => navigate('/profile')}>
                        <div className={styles['user-avatar']}>
                            {user?.email?.[0]?.toUpperCase() || <UserOutlined />}
                        </div>
                        <span className={styles['user-name']}>
                            {user?.email?.split('@')[0] || 'User'}
                        </span>
                    </div>

                    <button className={styles['logout-btn']} onClick={handleLogout}>
                        <LogoutOutlined /> Logout
                    </button>
                </div>
            </header>

            <Content className={styles['app-content']}>
                <Outlet />
            </Content>
        </Layout>
    );
};
