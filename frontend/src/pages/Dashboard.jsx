import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import Tooltip from '../components/Tooltip';
import ProgressBar from '../components/ProgressBar';
import api from '../api/axios';
import { formatCurrency as formatCurr } from '../utils/formatters';
import { MdInsertChart, MdAddCircle, MdList, MdAnalytics, MdInsertChart as MdReport, MdCategory, MdLightbulb } from 'react-icons/md';
import './Dashboard.css';

const EMPTY_DASHBOARD_STATS = {
  totalIncome: 0,
  totalExpenses: 0,
  currentBalance: 0,
  budget: {
    spent: 0,
    total: null,
    progress: null
  },
  quickStats: {
    topCategory: null,
    topCategoryAmount: 0
  }
};

const EMPTY_MONTHLY_REPORT = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalIncome: 0,
  totalExpenses: 0,
  totalSavings: 0,
  message: "No transactions this month."
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch dashboard stats using TanStack Query
  const { data: stats = EMPTY_DASHBOARD_STATS, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch monthly report using TanStack Query
  const { data: monthlyReport = EMPTY_MONTHLY_REPORT, isLoading: reportLoading } = useQuery({
    queryKey: ['monthlyReport'],
    queryFn: async () => {
      const res = await api.get('/reports/monthly');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loading = statsLoading || reportLoading;

  const quickActions = [
    { label: 'Add Expense', icon: <MdAddCircle size={24} />, onClick: () => navigate('/add-expense'), color: 'var(--color-primary)' },
    { label: 'History', icon: <MdList size={24} />, onClick: () => navigate('/history'), color: 'var(--color-success)' },
    { label: 'Analytics', icon: <MdAnalytics size={24} />, onClick: () => navigate('/analytics'), color: 'var(--color-warning)' },
    { label: 'Reports', icon: <MdReport size={24} />, onClick: () => navigate('/reports'), color: 'var(--color-danger)' },
    { label: 'Categories', icon: <MdCategory size={24} />, onClick: () => navigate('/categories'), color: 'var(--color-info)' },
    { label: 'AI Insights', icon: <MdLightbulb size={24} />, onClick: () => navigate('/analytics'), color: 'var(--color-purple)' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, here's your overview.</p>
        </div>
        <Tooltip content="Add a new expense record">
          <Button variant="primary" onClick={() => navigate('/add-expense')}>Add Expense</Button>
        </Tooltip>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-label">Total Income</div>
          {loading ? (
            <Skeleton width="100px" height="24px" />
          ) : (
            <div className="stat-value success">{formatCurr(stats.totalIncome || 0)}</div>
          )}
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Expenses</div>
          {loading ? (
            <Skeleton width="100px" height="24px" />
          ) : (
            <div className="stat-value danger">{formatCurr(stats.totalExpenses || 0)}</div>
          )}
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Remaining Balance</div>
          {loading ? (
            <Skeleton width="100px" height="24px" />
          ) : (
            <div className="stat-value">{formatCurr(stats.currentBalance || 0)}</div>
          )}
        </Card>
      </div>

      {/* Budget Card */}
      <Card title="Monthly Budget" className="budget-card">
        {loading ? (
          <div style={{ padding: '1rem' }}>
            <Skeleton width="100%" height="40px" />
            <Skeleton width="80%" height="20px" style={{ marginTop: '0.5rem' }} />
          </div>
        ) : stats.budget.total ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Monthly Budget</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatCurr(stats.budget.total)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Spent</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                    {formatCurr(stats.budget.spent)}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <ProgressBar 
                  percent={Math.round(stats.budget.progress || 0)} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {Math.round(stats.budget.progress || 0)}% used
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Remaining: {formatCurr(stats.budget.total - stats.budget.spent)}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>No Monthly Budget Configured</p>
              <Button variant="primary" onClick={() => navigate('/settings')}>Set Budget</Button>
            </div>
          )}
      </Card>

      {/* Monthly Summary Card */}
      <Card title="Monthly Summary" className="summary-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem' }}>
            <Skeleton width="80px" height="24px" />
            <Skeleton width="80px" height="24px" />
            <Skeleton width="80px" height="24px" />
          </div>
        ) : monthlyReport.message === "No transactions this month." ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            No transactions this month.
          </div>
        ) : (
          <>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="summary-label">Income</div>
                <div className="summary-value success">{formatCurr(monthlyReport.totalIncome || 0)}</div>
              </div>
              <div className="summary-stat">
                <div className="summary-label">Expenses</div>
                <div className="summary-value danger">{formatCurr(monthlyReport.totalExpenses || 0)}</div>
              </div>
              <div className="summary-stat">
                <div className="summary-label">Savings</div>
                <div className={`summary-value ${monthlyReport.totalSavings >= 0 ? 'success' : 'danger'}`}>
                  {formatCurr(monthlyReport.totalSavings || 0)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => navigate('/reports')}>
                <MdInsertChart style={{ marginRight: '0.5rem' }} /> View Full Report
              </Button>
            </div>
          </>
        )}
      </Card>

      <div className="dashboard-content">
        <Card title="Quick Actions" className="quick-actions-card">
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={action.onClick}
                style={{ '--action-color': action.color }}
              >
                <div className="quick-action-icon" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
