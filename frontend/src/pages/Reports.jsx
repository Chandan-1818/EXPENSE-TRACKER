import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Select from '../components/Select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import { MdPictureAsPdf, MdDescription } from 'react-icons/md';
import './Reports.css';

const EMPTY_REPORT = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalIncome: 0,
  totalExpenses: 0,
  totalSavings: 0,
  totalTransactions: 0,
  highestExpense: null,
  highestIncome: null,
  highestCategory: null,
  highestCategoryAmount: 0,
  totalCategoriesUsed: 0,
  averageSpend: 0,
  budget: null,
  budgetUsedPercent: null,
  budgetRemaining: null,
  numExpenseTransactions: 0,
  numIncomeTransactions: 0,
  pieData: [],
  barData: [],
  lineData: [],
  insights: []
};

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 5; year <= currentYear; year++) {
    yearOptions.push({ value: year, label: year.toString() });
  }

  // Fetch report data using TanStack Query
  const { data: reportData = EMPTY_REPORT, isLoading, error } = useQuery({
    queryKey: ['monthlyReport', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await api.get('/reports/monthly', {
        params: { month: selectedMonth, year: selectedYear }
      });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  const getMonthName = (month) => {
    return monthOptions.find(m => m.value === month)?.label || '';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csvContent = '';
    
    // Header
    csvContent += 'Metric,Value\n';
    csvContent += `Month,${getMonthName(reportData.month)} ${reportData.year}\n`;
    csvContent += `Total Income,${reportData.totalIncome}\n`;
    csvContent += `Total Expenses,${reportData.totalExpenses}\n`;
    csvContent += `Total Savings,${reportData.totalSavings}\n`;
    csvContent += `Total Transactions,${reportData.totalTransactions}\n`;
    
    // Create a blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Monthly_Report_${reportData.month}_${reportData.year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print
    window.print();
  };

  if (error) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1>Monthly Reports</h1>
          <p>View and export your monthly financial summaries.</p>
        </div>
        <Alert type="error" message={error.message || 'Failed to fetch monthly report'} />
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Monthly Reports</h1>
          <p>View and export your monthly financial summaries.</p>
        </div>
        <div className="header-controls">
          <div className="month-selectors">
            <Select
              options={monthOptions}
              value={selectedMonth}
              onChange={(value) => setSelectedMonth(value)}
              label="Month"
            />
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              label="Year"
            />
          </div>
          <div className="export-buttons">
            <Button variant="secondary" onClick={exportToCSV}>
              <MdDescription style={{ marginRight: '0.5rem' }} /> CSV
            </Button>
            <Button variant="secondary" onClick={exportToPDF}>
              <MdPictureAsPdf style={{ marginRight: '0.5rem' }} /> PDF
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="kpi-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="kpi-card">
              <Skeleton width="100px" height="16px" />
              <Skeleton width="120px" height="28px" style={{ marginTop: '0.5rem' }} />
            </Card>
          ))}
        </div>
      ) : reportData.message === "No transactions this month." ? (
        <Card className="empty-state">
          <h3>No transactions this month.</h3>
          <p>Add some transactions to view your monthly summary.</p>
        </Card>
      ) : (
        <>
          {/* Monthly Insights Card */}
          {reportData.insights.length > 0 && (
            <Card className="insights-card">
              <h3>Monthly Insights</h3>
              <div className="insights-list">
                {reportData.insights.map((insight, i) => (
                  <div key={i} className={`insight-item insight-${insight.type}`}>
                    {insight.message}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* KPI Grid */}
          <div className="kpi-grid">
            <Card className="kpi-card">
              <h4>Income</h4>
              <div className="kpi-value success">{formatCurrency(reportData.totalIncome)}</div>
            </Card>
            <Card className="kpi-card">
              <h4>Expenses</h4>
              <div className="kpi-value danger">{formatCurrency(reportData.totalExpenses)}</div>
            </Card>
            <Card className="kpi-card">
              <h4>Savings</h4>
              <div className={`kpi-value ${reportData.totalSavings >= 0 ? 'success' : 'danger'}`}>
                {formatCurrency(reportData.totalSavings)}
              </div>
            </Card>

            <Card className="kpi-card">
              <h4>Highest Expense</h4>
              {reportData.highestExpense ? (
                <>
                  <div className="kpi-value danger">{formatCurrency(reportData.highestExpense.amount)}</div>
                  <div className="kpi-trend">{reportData.highestExpense.description}</div>
                </>
              ) : (
                <div className="kpi-value" style={{ color: 'var(--color-text-tertiary)' }}>--</div>
              )}
            </Card>
            <Card className="kpi-card">
              <h4>Highest Category</h4>
              {reportData.highestCategory ? (
                <>
                  <div className="kpi-value">{reportData.highestCategory}</div>
                  <div className="kpi-trend">{formatCurrency(reportData.highestCategoryAmount)}</div>
                </>
              ) : (
                <div className="kpi-value" style={{ color: 'var(--color-text-tertiary)' }}>--</div>
              )}
            </Card>
            <Card className="kpi-card">
              <h4>Transactions</h4>
              <div className="kpi-value">{reportData.totalTransactions}</div>
            </Card>
            <Card className="kpi-card">
              <h4>Average Spend</h4>
              <div className="kpi-value danger">{formatCurrency(reportData.averageSpend || 0)}</div>
            </Card>
            <Card className="kpi-card">
              <h4>Budget Used</h4>
              {reportData.budget ? (
                <>
                  <div className="kpi-value warning">
                    {reportData.budgetUsedPercent != null ? `${reportData.budgetUsedPercent.toFixed(0)}%` : '0%'}
                  </div>
                  <div className="kpi-trend">
                    {formatCurrency(reportData.totalExpenses)} / {formatCurrency(reportData.budget)}
                  </div>
                </>
              ) : (
                <div className="kpi-value" style={{ color: 'var(--color-text-tertiary)' }}>
                  No Monthly Budget
                </div>
              )}
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <Card title="Expense by Category" className="chart-card-small">
              <div className="chart-container">
                {reportData.pieData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">No expense data available.</div>
                )}
              </div>
            </Card>

            <Card title="Income vs Expenses" className="chart-card-large">
              <div className="chart-container">
                {reportData.barData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">No chart data available.</div>
                )}
              </div>
            </Card>
          </div>

          <div className="charts-grid">
            <Card title="Daily Spending" className="chart-card-full">
              <div className="chart-container">
                {reportData.lineData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="amount" name="Spending" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">No daily spending data available.</div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
