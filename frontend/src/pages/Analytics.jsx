import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Skeleton from '../components/Skeleton';
import DropdownMenu from '../components/DropdownMenu';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import { MdFilterList } from 'react-icons/md';
import './Analytics.css';

const EMPTY_ANALYTICS = {
  kpi: {
    averageSpend: 0,
    savingsRate: null,
    savingsRateTrend: '-',
    highestCategory: null,
    highestCategoryAmount: 0,
    budgetUtilization: null,
    budgetTotal: null
  },
  monthlyData: [],
  pieData: [],
  topCategories: [],
  monthlyComparison: { current: 0, previous: 0, change: 0 },
  insights: []
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('This Month');

  // Fetch analytics data using TanStack Query
  const { data: analyticsData = EMPTY_ANALYTICS, isLoading, error } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const res = await api.get('/analytics', { params: { timeRange } });
      return res.data.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value || 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const filterOptions = [
    { label: 'This Month', onClick: () => setTimeRange('This Month') },
    { label: 'Last Month', onClick: () => setTimeRange('Last Month') },
    { label: 'This Year', onClick: () => setTimeRange('This Year') },
  ];

  const OverviewTab = () => (
    <>
      <div className="kpi-grid">
        <Card className="kpi-card">
          <h4>Average Spend</h4>
          {isLoading ? <Skeleton width="100px" height="24px" /> : <div className="kpi-value danger">{formatCurrency(analyticsData.kpi.averageSpend || 0)}</div>}
          <div className="kpi-trend">{(analyticsData.kpi.averageSpend || 0) > 0 ? 'Trend calculation pending' : 'No expenses yet'}</div>
        </Card>
        <Card className="kpi-card">
          <h4>Savings Rate</h4>
          {isLoading ? <Skeleton width="100px" height="24px" /> : 
           analyticsData.kpi.savingsRate != null ? 
           <div className="kpi-value success">{Math.round(analyticsData.kpi.savingsRate)}%</div> :
           <div className="kpi-value" style={{ color: 'var(--color-text-tertiary)' }}>--</div>}
          <div className="kpi-trend">{analyticsData.kpi.savingsRateTrend || '-'}</div>
        </Card>
        <Card className="kpi-card">
          <h4>Highest Category</h4>
          {isLoading ? <Skeleton width="100px" height="24px" /> : 
           analyticsData.kpi.highestCategory ? 
           <div className="kpi-value">{analyticsData.kpi.highestCategory}</div> :
           <div className="kpi-value" style={{ color: 'var(--color-text-tertiary)' }}>No category data</div>}
          <div className="kpi-trend">{analyticsData.kpi.highestCategory ? formatCurrency(analyticsData.kpi.highestCategoryAmount) : ''}</div>
        </Card>
        <Card className="kpi-card">
          <h4>Budget Utilization</h4>
          {isLoading ? <Skeleton width="100px" height="24px" /> : 
           analyticsData.kpi.budgetUtilization != null ? 
           <div className="kpi-value warning">{Math.round(analyticsData.kpi.budgetUtilization)}%</div> :
           <div className="kpi-value" style={{ color: 'var(--color-text-tertiary)' }}>No monthly budget configured</div>}
          <div className="kpi-trend">{analyticsData.kpi.budgetUtilization != null ? 
            `of ${formatCurrency(analyticsData.kpi.budgetTotal)} budget` : 
            'Set a monthly budget in Settings.'}</div>
        </Card>
      </div>

      <div className="charts-grid">
        <Card title="Income vs Expenses" className="chart-card-large">
          <div className="chart-container">
            {isLoading ? (
              <Skeleton width="100%" height="300px" />
            ) : analyticsData.monthlyData.length > 0 && 
              analyticsData.monthlyData.some(d => (d.income > 0 || d.expense > 0)) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--color-text-secondary)' }}>
                <div>No analytics available yet.</div>
                <div style={{ marginTop: '0.5rem' }}>Add some transactions to view trends.</div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Expense Distribution" className="chart-card-small">
          <div className="chart-container">
            {isLoading ? (
              <Skeleton width="100%" height="300px" borderRadius="50%" />
            ) : analyticsData.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--color-text-secondary)' }}>No expense data available.</div>
            )}
          </div>
        </Card>
      </div>
    </>
  );

  const TrendsTab = () => (
    <Card title="Spending Trend" className="chart-card-full">
      <div className="chart-container">
        {isLoading ? (
          <Skeleton width="100%" height="300px" />
        ) : analyticsData.monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="expense" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--color-text-secondary)' }}>No spending trend data available.</div>
        )}
      </div>
    </Card>
  );

  if (error) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h1>Analytics Overview</h1>
          <p>Insights into your financial habits and trends.</p>
        </div>
        <div className="error-message" style={{ color: 'var(--color-danger)', padding: '2rem' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Analytics Overview</h1>
          <p>Insights into your financial habits and trends.</p>
        </div>
        <DropdownMenu 
          trigger={<button className="filter-btn"><MdFilterList /> {timeRange}</button>}
          items={filterOptions}
          align="right"
        />
      </div>

      <Tabs 
        tabs={[
          { label: 'Overview', id: 'overview', content: <OverviewTab /> },
          { label: 'Trends', id: 'trends', content: <TrendsTab /> }
        ]} 
      />
    </div>
  );
};

export default Analytics;
