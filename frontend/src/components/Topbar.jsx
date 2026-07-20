import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdNotifications, MdPalette } from 'react-icons/md';
import Avatar from './Avatar';
import DropdownMenu from './DropdownMenu';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import './Topbar.css';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications', { params: { limit: 1 } });
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const themeOptions = [
    { label: 'Classic', onClick: () => setTheme('classic') },
    { label: 'Modern Light', onClick: () => setTheme('modern-light') },
    { label: 'Glass Dark', onClick: () => setTheme('glass-dark') },
    { label: 'Dark', onClick: () => setTheme('dark') }
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-icon-btn mobile-menu-btn" onClick={onMenuClick} aria-label="Menu">
          <MdMenu size={24} />
        </button>
        <span className="mobile-title">ExpensePro</span>
      </div>
      <div className="topbar-right">
        <DropdownMenu
          trigger={
            <button className="topbar-icon-btn" aria-label="Theme">
              <MdPalette size={24} />
            </button>
          }
          items={themeOptions}
          align="right"
        />
        <button 
          className="topbar-icon-btn notification-btn" 
          onClick={handleNotificationClick}
          aria-label="Notifications"
        >
          <MdNotifications size={24} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <DropdownMenu 
          trigger={
            <div className="topbar-avatar">
              <Avatar name={user?.name || 'User'} size="sm" status="online" />
            </div>
          }
          items={[
            { label: 'Profile', onClick: () => navigate('/profile') },
            { label: 'Settings', onClick: () => navigate('/settings') },
            { type: 'divider' },
            { label: 'Logout', onClick: handleLogout }
          ]}
          align="right"
        />
      </div>
    </header>
  );
};

export default Topbar;
