import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Tooltip from '../components/Tooltip';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';
import './ExpenseHistory.css';

const EMPTY_TRANSACTIONS_DATA = {
  expenses: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5
  }
};

const ExpenseHistory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Fetch categories using TanStack Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch transactions using TanStack Query
  const { data: transactionsData = EMPTY_TRANSACTIONS_DATA, isLoading } = useQuery({
    queryKey: ['expenses', currentPage, searchTerm, categoryFilter],
    queryFn: async () => {
      const res = await api.get('/expenses', {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          category: categoryFilter || undefined
        }
      });
      return res.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const transactions = transactionsData.expenses;
  const totalPages = transactionsData.pagination.totalPages;

  // Helper function to check if transaction is editable and get status
  const getTransactionEditStatus = (createdAt) => {
    const createdAtDate = new Date(createdAt);
    const timeDiff = Date.now() - createdAtDate.getTime();
    const isEditable = timeDiff < 24 * 60 * 60 * 1000;
    const expiryDate = new Date(createdAtDate.getTime() + 24 * 60 * 60 * 1000);
    
    if (isEditable) {
      // Calculate remaining time
      const remainingMs = 24 * 60 * 60 * 1000 - timeDiff;
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        isEditable,
        statusText: `Editable until: ${expiryDate.toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        remainingText: remainingHours > 0 
          ? `${remainingHours} hour${remainingHours > 1 ? 's' : ''} remaining` 
          : `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} remaining`
      };
    }
    
    return {
      isEditable,
      statusText: 'Editing expired',
      remainingText: ''
    };
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.name }));

  const handleDeletePrompt = (tx) => {
    setDeletingTx(tx);
    setIsConfirmOpen(true);
  };

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      showToast('Transaction deleted successfully');
      setIsConfirmOpen(false);
      // Invalidate expenses query to refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // If we deleted the last item on a page, go back one page (if not on page 1)
      if (transactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to delete transaction', 'error');
    }
  });

  const handleDelete = () => {
    if (deletingTx) {
      deleteMutation.mutate(deletingTx._id);
    }
  };

  return (
    <div className="expense-history">
      <div className="history-header">
        <div>
          <h1>Expense History</h1>
          <p>View and manage all your past transactions.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/add-expense')}>
          <MdAdd /> Add Expense
        </Button>
      </div>

      <Card className="history-card">
        <div className="filters-row">
          <div className="search-box">
            <Input 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="filter-box">
            <Select 
              options={categoryOptions}
              placeholder="All Categories"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Desktop/Tablet Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton width="80px" height="20px" /></td>
                    <td><Skeleton width="150px" height="20px" /></td>
                    <td><Skeleton width="100px" height="24px" borderRadius="12px" /></td>
                    <td><Skeleton width="60px" height="24px" borderRadius="12px" /></td>
                    <td><Skeleton width="80px" height="20px" /></td>
                    <td><Skeleton width="180px" height="32px" /></td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map(tx => {
                  const editStatus = getTransactionEditStatus(tx.createdAt);
                  return (
                  <tr key={tx._id}>
                    <td>{formatDate(tx.date)}</td>
                    <td className="tx-desc-cell">
                      <div>{tx.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                        {editStatus.remainingText || editStatus.statusText}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{tx.category}</span>
                    </td>
                    <td>
                      <span className={`type-badge ${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`amount-cell ${tx.type === 'income' ? 'success' : ''}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="actions-cell">
                      {editStatus.isEditable ? (
                        <Tooltip content="Edit Transaction">
                          <button className="action-btn edit" onClick={() => navigate(`/edit-expense/${tx._id}`)}><MdEdit /></button>
                        </Tooltip>
                      ) : (
                        <Badge text="Editing expired" variant="muted" />
                      )}
                      <Tooltip content="Delete">
                        <button className="action-btn delete" onClick={() => handleDeletePrompt(tx)}><MdDelete /></button>
                      </Tooltip>
                    </td>
                  </tr>
                );})
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    <EmptyState 
                      title="No transactions found" 
                      description="Try adjusting your filters or search term."
                      icon={<MdSearch size={48} />} 
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Transaction Cards */}
        <div className="tx-cards-container">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="tx-card-item">
                <div className="tx-card-header">
                  <div>
                    <Skeleton width="120px" height="20px" />
                    <Skeleton width="80px" height="16px" style={{ marginTop: '4px' }} />
                  </div>
                  <Skeleton width="80px" height="24px" />
                </div>
                <Skeleton width="100%" height="24px" />
              </div>
            ))
          ) : transactions.length > 0 ? (
            transactions.map(tx => {
              const editStatus = getTransactionEditStatus(tx.createdAt);
              return (
                <div key={tx._id} className="tx-card-item">
                  <div className="tx-card-header">
                    <div>
                      <div className="tx-card-title">{tx.description}</div>
                      <div className="tx-card-date">{formatDate(tx.date)}</div>
                    </div>
                    <div className={`tx-card-amount ${tx.type === 'income' ? 'success' : ''}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                  <div className="tx-card-details">
                    <span className="category-badge">{tx.category}</span>
                    <span className={`type-badge ${tx.type}`}>{tx.type}</span>
                  </div>
                  <div className="tx-card-status">
                    {editStatus.remainingText || editStatus.statusText}
                  </div>
                  <div className="tx-card-actions">
                    {editStatus.isEditable ? (
                      <Tooltip content="Edit Transaction">
                        <button className="action-btn edit" onClick={() => navigate(`/edit-expense/${tx._id}`)}><MdEdit /></button>
                      </Tooltip>
                    ) : (
                      <Badge text="Editing expired" variant="muted" />
                    )}
                    <Tooltip content="Delete">
                      <button className="action-btn delete" onClick={() => handleDeletePrompt(tx)}><MdDelete /></button>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState 
              title="No transactions found" 
              description="Try adjusting your filters or search term."
              icon={<MdSearch size={48} />} 
            />
          )}
        </div>

        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      <Modal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete <strong>{deletingTx?.description}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
    </div>
  );
};

export default ExpenseHistory;
