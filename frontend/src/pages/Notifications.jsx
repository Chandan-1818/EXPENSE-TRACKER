import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import Alert from '../components/Alert';
import api from '../api/axios';
import { MdNotifications, MdDelete, MdCheckCircle } from 'react-icons/md';
import './Notifications.css';

const EMPTY_NOTIFICATIONS_DATA = {
  notifications: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  unreadCount: 0
};

const Notifications = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const filterOptions = [
    { label: 'All Types', value: '' },
    { label: 'System', value: 'System' },
    { label: 'Payment', value: 'Payment' },
    { label: 'Report', value: 'Report' }
  ];

  // Fetch notifications using TanStack Query
  const { data: notificationsData = EMPTY_NOTIFICATIONS_DATA, isLoading, error } = useQuery({
    queryKey: ['notifications', currentPage, searchTerm, filterType],
    queryFn: async () => {
      const params = { page: currentPage, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.type = filterType;

      const res = await api.get('/notifications', { params });
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const notifications = notificationsData.notifications;
  const totalPages = notificationsData.pagination.totalPages;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      setToastMessage('Notification marked as read');
      setToastType('success');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      setToastMessage(err.response?.data?.message || 'Failed to mark as read');
      setToastType('error');
      setShowToast(true);
    }
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      setToastMessage('All notifications marked as read');
      setToastType('success');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      setToastMessage(err.response?.data?.message || 'Failed to mark all as read');
      setToastType('error');
      setShowToast(true);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      setToastMessage('Notification deleted');
      setToastType('success');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      setToastMessage(err.response?.data?.message || 'Failed to delete notification');
      setToastType('error');
      setShowToast(true);
    }
  });

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleDelete = (id) => {
    deleteNotificationMutation.mutate(id);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notification Center</h1>
        <p>Stay updated with your latest alerts and reports.</p>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message={error.message || 'Failed to fetch notifications'} />
        </div>
      )}

      <Card className="notif-card">
        <div className="notif-toolbar">
          <div className="notif-filters">
            <div className="search-box">
              <Input 
                placeholder="Search notifications..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <Select 
                options={filterOptions}
                placeholder="All Types"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" onClick={handleMarkAllRead} disabled={isLoading}>
            <MdCheckCircle style={{ marginRight: '8px' }} /> Mark All Read
          </Button>
        </div>

        <div className="notif-list">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="notif-item">
                <Skeleton width="48px" height="48px" borderRadius="50%" />
                <div style={{ flex: 1, marginLeft: '1rem' }}>
                  <Skeleton width="200px" height="20px" style={{ marginBottom: '8px' }} />
                  <Skeleton width="300px" height="16px" />
                </div>
              </div>
            ))
          ) : notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n._id} className={`notif-item ${n.isRead ? 'read' : 'unread'}`}>
                <div className="notif-icon-container">
                  <MdNotifications className="notif-icon" />
                  {!n.isRead && <span className="unread-dot"></span>}
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4>{n.title}</h4>
                    <span className="notif-time">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="notif-message">{n.message}</p>
                </div>
                <div className="notif-actions">
                  {!n.isRead && (
                    <button className="action-btn check" onClick={() => handleMarkAsRead(n._id)} title="Mark as read">
                      <MdCheckCircle />
                    </button>
                  )}
                  <button className="action-btn delete" onClick={() => handleDelete(n._id)} title="Delete">
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <MdNotifications size={48} color="var(--color-text-tertiary)" />
              <p>You have no notifications at the moment.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && !isLoading && notifications.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <Toast 
        isVisible={showToast} 
        message={toastMessage} 
        type={toastType}
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default Notifications;
