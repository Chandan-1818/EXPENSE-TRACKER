import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import Tooltip from '../components/Tooltip';
import Alert from '../components/Alert';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import { MdEdit } from 'react-icons/md';
import './Profile.css';

const EMPTY_PROFILE = {
  _id: '',
  name: '',
  email: '',
  phone: '',
  occupation: '',
  location: '',
  avatar: '',
  createdAt: ''
};

const EMPTY_STATS = {
  totalIncome: 0,
  totalExpenses: 0,
  remainingBalance: 0
};

const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [error, setError] = useState(null);

  // Fetch profile data using TanStack Query
  const { data: profileUser = EMPTY_PROFILE, isLoading: isPageLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/auth/profile');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stats using TanStack Query
  const { data: stats = EMPTY_STATS } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const [profileData, setProfileData] = useState({
    name: profileUser.name || '',
    email: profileUser.email || '',
    avatar: profileUser.avatar || '',
    joinDate: profileUser.createdAt || ''
  });

  const [formData, setFormData] = useState({ ...profileData });

  useEffect(() => {
    setProfileData({
      name: profileUser.name || '',
      email: profileUser.email || '',
      avatar: profileUser.avatar || '',
      joinDate: profileUser.createdAt || ''
    });
    setFormData({
      name: profileUser.name || '',
      email: profileUser.email || '',
      avatar: profileUser.avatar || '',
      joinDate: profileUser.createdAt || ''
    });
  }, [profileUser]);

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.put('/auth/profile', formData);
      setProfileData({ ...formData, joinDate: res.data.data?.createdAt });
      setToastMessage('Profile updated successfully!');
      setToastType('success');
      setShowToast(true);
      setIsEditModalOpen(false);
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setToastMessage('Failed to update profile');
      setToastType('error');
      setShowToast(true);
    }
  };


  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and preferences.</p>
      </div>

      {typeof error === "string" && error.trim() !== "" && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <div className="profile-grid">
        <Card className="profile-card">
          <div className="profile-header">
            <div className="profile-name-section">
              {isPageLoading ? (
                <Skeleton width="200px" height="32px" />
              ) : (
                <h2>{profileData.name || 'No name set'}</h2>
              )}
              {isPageLoading ? (
                <Skeleton width="120px" height="40px" />
              ) : (
                <Tooltip content="Update your personal info">
                  <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                    <MdEdit style={{ marginRight: '8px' }} /> Edit Profile
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <div>
                <label>Member since</label>
                {isPageLoading ? <Skeleton width="120px" height="20px" /> : <p>{formatDate(profileData.joinDate)}</p>}
              </div>
            </div>
            <div className="detail-item">
              <div>
                <label>Email Address</label>
                {isPageLoading ? <Skeleton width="150px" height="20px" /> : <p>{profileData.email || 'Not set'}</p>}
              </div>
            </div>
          </div>
        </Card>

        <div className="profile-stats-section">
          <h3 className="stats-title">Statistics</h3>
          <div className="profile-stats">
            <Card className="stat-card-small">
              <h4>Total Income</h4>
              {isPageLoading ? <Skeleton width="100px" height="24px" /> : <div className="stat-value success">{formatCurrency(stats.totalIncome || 0)}</div>}
            </Card>
            <Card className="stat-card-small">
              <h4>Total Expenses</h4>
              {isPageLoading ? <Skeleton width="100px" height="24px" /> : <div className="stat-value danger">{formatCurrency(stats.totalExpenses || 0)}</div>}
            </Card>
            <Card className="stat-card-small">
              <h4>Current Balance</h4>
              {isPageLoading ? <Skeleton width="100px" height="24px" /> : <div className="stat-value primary">{formatCurrency(stats.remainingBalance || 0)}</div>}
            </Card>
            <Card className="stat-card-small">
              <h4>Monthly Savings</h4>
              {isPageLoading ? <Skeleton width="100px" height="24px" /> : <div className="stat-value warning">{formatCurrency((stats.totalIncome || 0) - (stats.totalExpenses || 0))}</div>}
            </Card>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="edit-profile-form">
          <Input 
            label="Full Name" 
            id="name"
            value={formData.name}
            onChange={handleEditChange}
            required
          />
          <Input 
            label="Email Address" 
            type="email"
            id="email"
            value={formData.email}
            onChange={handleEditChange}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPageLoading}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <Toast 
        isVisible={showToast} 
        message={toastMessage} 
        type={toastType}
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default Profile;
