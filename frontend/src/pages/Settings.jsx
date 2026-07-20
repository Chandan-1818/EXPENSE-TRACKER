import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import Tabs from '../components/Tabs';
import Skeleton from '../components/Skeleton';
import Tooltip from '../components/Tooltip';
import Alert from '../components/Alert';
import Input from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MdPalette, MdNotifications, MdSecurity, MdDataUsage, MdDelete, MdWarning } from 'react-icons/md';
import './Settings.css';

const VALID_THEMES = ['classic', 'modern-light', 'glass-dark', 'dark'];
const DEFAULT_SETTINGS = {
  theme: 'classic',
  currency: 'INR',
  dateFormat: 'MM/DD/YYYY',
  emailNotif: true,
  pushNotif: false,
  budgetAlerts: true,
  language: 'en',
  monthlyBudget: null
};
const CURRENCY_OPTIONS = [
  { label: 'Indian Rupee (₹)', value: 'INR' },
  { label: 'US Dollar ($)', value: 'USD' },
  { label: 'Euro (€)', value: 'EUR' }
];
const THEMES = [
  { id: 'classic', name: 'Classic', description: 'Original light theme' },
  { id: 'modern-light', name: 'Modern Light', description: 'Clean and professional' },
  { id: 'glass-dark', name: 'Glass Dark', description: 'Premium glass & dark theme' },
  { id: 'dark', name: 'Dark', description: 'Premium dark theme' }
];

const ThemePreview = ({ themeId, isSelected, onClick }) => {
  const themeColors = {
    'classic': { bg: '#f3f4f6', primary: '#6366f1', surface: '#ffffff' },
    'modern-light': { bg: '#f8fafc', primary: '#4f46e5', surface: '#ffffff' },
    'glass-dark': { bg: '#0B1120', primary: '#7C3AED', surface: 'rgba(30,41,59,0.45)' },
    'dark': { bg: '#0B1120', primary: '#7C3AED', surface: '#1E293B' }
  };
  const colors = themeColors[themeId];
  
  return (
    <div 
      className={`theme-preview ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="theme-preview-card" style={{ backgroundColor: colors.bg, borderRadius: '8px', padding: '12px', height: '100px' }}>
        <div style={{ backgroundColor: colors.surface, borderRadius: '4px', padding: '8px', marginBottom: '8px' }}>
          <div style={{ backgroundColor: colors.primary, width: '40%', height: '8px', borderRadius: '4px' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ backgroundColor: colors.primary, width: '30%', height: '16px', borderRadius: '4px' }}></div>
          <div style={{ backgroundColor: colors.surface, flex: 1, height: '16px', borderRadius: '4px' }}></div>
        </div>
      </div>
      <p className="theme-preview-name" style={{ marginTop: '8px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {THEMES.find(t => t.id === themeId)?.name}
      </p>
    </div>
  );
};

const AppearanceTab = ({ loading, settings, onSettingChange, onThemeChange }) => (
  <div className="settings-form" style={{ padding: '1rem 0' }}>
    <div className="setting-item">
      <label style={{ marginBottom: '1rem', display: 'block' }}>Theme</label>
      {loading ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[1,2,3,4].map(i => <Skeleton key={i} width="200px" height="150px" />)}
        </div>
      ) : (
        <div className="theme-previews" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {THEMES.map(t => (
            <ThemePreview 
              key={t.id} 
              themeId={t.id} 
              isSelected={settings.theme === t.id} 
              onClick={() => onThemeChange(t.id)} 
            />
          ))}
        </div>
      )}
    </div>
    <div className="setting-item">
      {loading ? (
        <Skeleton width="100%" height="40px" />
      ) : (
        <Select 
          label="Default Currency" 
          name="currency"
          options={CURRENCY_OPTIONS}
          value={settings.currency}
          onChange={onSettingChange}
        />
      )}
    </div>
    <div className="setting-item">
      {loading ? (
        <Skeleton width="100%" height="40px" />
      ) : (
        <Input 
          label="Monthly Budget"
          type="text"
          inputMode="numeric"
          name="monthlyBudget"
          placeholder="Enter your monthly budget"
          prefix="₹"
          value={settings.monthlyBudget !== null ? String(settings.monthlyBudget) : ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            onSettingChange({ target: { name: 'monthlyBudget', value, type: 'text' } });
          }}
          className="has-prefix"
        />
      )}
    </div>
  </div>
);

const NotificationsTab = ({ loading, settings, onSettingChange }) => (
  <div className="settings-form" style={{ padding: '1rem 0' }}>
    {loading ? (
      Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
           <div>
             <Skeleton width="120px" height="16px" style={{ marginBottom: '8px' }} />
             <Skeleton width="200px" height="12px" />
           </div>
           <Skeleton width="40px" height="24px" borderRadius="12px" />
        </div>
      ))
    ) : (
      <>
        <div className="setting-item-toggle">
          <div className="toggle-info">
            <h4>Email Notifications</h4>
            <p>Receive daily and weekly summaries.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" name="emailNotif" checked={settings.emailNotif} onChange={onSettingChange} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item-toggle">
          <div className="toggle-info">
            <h4>Push Notifications</h4>
            <p>Get instant alerts on your device.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" name="pushNotif" checked={settings.pushNotif} onChange={onSettingChange} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item-toggle">
          <div className="toggle-info">
            <h4>Budget Alerts</h4>
            <p>Notify me when I exceed my budget.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" name="budgetAlerts" checked={settings.budgetAlerts} onChange={onSettingChange} />
            <span className="slider"></span>
          </label>
        </div>
      </>
    )}
  </div>
);

const SecurityTab = ({ loading }) => (
  <div className="settings-form" style={{ padding: '1rem 0' }}>
    {loading ? (
      Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} width="100%" height="40px" style={{ marginBottom: '1rem' }} />
      ))
    ) : (
      <>
        <Tooltip content="Send password reset link to email">
          <Button variant="secondary" isFullWidth>Change Password</Button>
        </Tooltip>
        <Button variant="secondary" isFullWidth>Manage Two-Factor Authentication</Button>
        <Button variant="secondary" isFullWidth>View Active Sessions</Button>
      </>
    )}
  </div>
);

const DataTab = ({ loading, onClearData, onDeleteAccount }) => (
  <div className="settings-form" style={{ padding: '1rem 0' }}>
    {loading ? (
      Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} width="100%" height="40px" style={{ marginBottom: '1rem' }} />
      ))
    ) : (
      <>
        <Tooltip content="Download all your data as a CSV file">
          <Button variant="secondary" isFullWidth>Export Data (CSV)</Button>
        </Tooltip>
        <Tooltip content="Permanently delete local data">
          <Button variant="danger" isFullWidth onClick={onClearData}>
            <MdDelete style={{ marginRight: '8px' }} /> Clear Local Data
          </Button>
        </Tooltip>

        <div 
          className="danger-zone" 
          style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            border: '2px solid rgba(239,68,68,0.3)', 
            backgroundColor: 'rgba(239,68,68,0.05)' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MdWarning style={{ color: '#EF4444', fontSize: '1.5rem' }} />
            <h3 style={{ color: 'var(--color-text-primary)', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Danger Zone</h3>
          </div>
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            marginBottom: '1.5rem', 
            lineHeight: 1.5 
          }}>
            Deleting your account permanently removes your profile, expenses, categories, reports, analytics, notifications, settings, and all associated data. This action cannot be undone.
          </p>
          <Button 
            variant="danger" 
            isFullWidth 
            onClick={onDeleteAccount}
          >
            <MdDelete style={{ marginRight: '8px' }} /> Delete My Account
          </Button>
        </div>
      </>
    )}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [alert, setAlert] = useState(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const settingsRef = useRef(settings); // Track latest settings!

  // Update ref whenever settings change!
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Fetch settings using TanStack Query
  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      const data = res.data.data || DEFAULT_SETTINGS;
      setSettings(data);
      localStorage.setItem('userSettings', JSON.stringify(data)); // Save to localStorage on fetch!
      if (data.theme && VALID_THEMES.includes(data.theme)) {
        setTheme(data.theme);
      }
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: () => {
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings);
        setSettings(parsedSettings);
        if (parsedSettings.theme && VALID_THEMES.includes(parsedSettings.theme)) {
          setTheme(parsedSettings.theme);
        }
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  });

  useEffect(() => {
    if (currentTheme && settings.theme !== currentTheme) {
      setSettings(prev => ({ ...prev, theme: currentTheme }));
    }
  }, [currentTheme, settings.theme]);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue;
    if (name === 'monthlyBudget') {
      processedValue = value ? Number(value) : null;
    } else {
      processedValue = type === 'checkbox' ? checked : value;
    }
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [name]: processedValue
      };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleThemeChange = async (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setTheme(newTheme);
    
    // First get the current settings (functional update) to create newSettings
    let newSettings;
    setSettings(prev => {
      newSettings = { ...prev, theme: newTheme };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return newSettings;
    });
    
    try {
      // Now wait a tick for newSettings to be set (or just use the functional update's value)
      if (newSettings) {
        await api.put('/settings', newSettings);
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      }
    } catch (err) {
      // Silent fail - settings saved locally
    }
  };

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (currentSettings) => {
      await api.put('/settings', currentSettings);
    },
    onSuccess: () => {
      setAlert({ type: 'success', message: 'All settings have been successfully synchronized.' });
      setToastMessage('Settings saved!');
      setToastType('success');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setAlert(null), 5000);
    },
    onError: () => {
      setAlert({ type: 'warning', message: 'Settings saved locally. Server synchronization failed.' });
      setToastMessage('Settings saved locally');
      setToastType('warning');
      setShowToast(true);
      setTimeout(() => setAlert(null), 5000);
    }
  });

  const saveSettings = () => {
    const currentSettings = settingsRef.current; // Use latest from ref!
    saveSettingsMutation.mutate(currentSettings);
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (password) => {
      await api.delete('/auth/delete-account', {
        data: { password }
      });
    },
    onSuccess: () => {
      localStorage.clear();
      sessionStorage.clear();
      logout();
      setToastMessage('Account deleted successfully');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (err) => {
      let message = 'Failed to delete account';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setAlert({ type: 'error', message });
      setTimeout(() => setAlert(null), 5000);
    }
  });

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(deletePassword);
  };

  const handleClearData = () => {
    setIsConfirmModalOpen(true);
  };

  const executeClearData = () => {
    setIsConfirmModalOpen(false);
    setToastMessage('Local data cleared successfully.');
    setShowToast(true);
  };

  const tabsData = [
    { id: 'appearance', label: 'Appearance', icon: <MdPalette size={16}/>, content: <AppearanceTab loading={isLoading} settings={settings} onSettingChange={handleSettingChange} onThemeChange={handleThemeChange} /> },
    { id: 'notifications', label: 'Notifications', icon: <MdNotifications size={16}/>, content: <NotificationsTab loading={isLoading} settings={settings} onSettingChange={handleSettingChange} /> },
    { id: 'security', label: 'Security', icon: <MdSecurity size={16}/>, content: <SecurityTab loading={isLoading} /> },
    { id: 'data', label: 'Data', icon: <MdDataUsage size={16}/>, content: <DataTab loading={isLoading} onClearData={handleClearData} onDeleteAccount={() => setIsDeleteModalOpen(true)} /> }
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </div>

      {alert && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <Card className="settings-section">
        <Tabs tabs={tabsData} />
      </Card>

      <div className="settings-actions" style={{ marginTop: '2rem' }}>
        <Button variant="primary" onClick={saveSettings}>Save Changes</Button>
      </div>

      <Toast 
        isVisible={showToast} 
        message={toastMessage} 
        type={toastType}
        onClose={() => setShowToast(false)} 
      />

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletePassword('');
          setDeleteConfirm(false);
        }}
        title="Delete Account"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          This action is permanent. All of your financial data will be permanently deleted.
        </p>
        
        <div style={{ marginBottom: '1.25rem' }}>
          <Input 
            type="password"
            label="Enter your password"
            placeholder="Your password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1.5rem' 
        }}>
          <input 
            type="checkbox"
            id="deleteConfirm"
            checked={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label 
            htmlFor="deleteConfirm" 
            style={{ 
              color: 'var(--color-text-secondary)', 
              cursor: 'pointer',
              margin: 0
            }}
          >
            I understand this action cannot be undone.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button 
            variant="secondary" 
            onClick={() => {
              setIsDeleteModalOpen(false);
              setDeletePassword('');
              setDeleteConfirm(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={!deletePassword || !deleteConfirm || deleteAccountMutation.isPending}
            isLoading={deleteAccountMutation.isPending}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Action"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to clear all local data? This action cannot be undone and will remove all your mocked expenses and preferences.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={executeClearData}>Yes, Clear Data</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
