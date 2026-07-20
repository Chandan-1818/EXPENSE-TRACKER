import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import ExpenseForm from '../components/ExpenseForm';
import api from '../api/axios';
import './AddExpense.css';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await api.get(`/expenses/${id}`);
        const expenseData = res.data.data;
        
        // Check if editing is allowed
        const isEditable = Date.now() - new Date(expenseData.createdAt).getTime() < 24 * 60 * 60 * 1000;
        if (!isEditable) {
          setIsExpired(true);
          // Redirect after 2-3 seconds
          setTimeout(() => {
            navigate('/expense-history');
          }, 2500);
          return;
        }
        
        setExpense({
          _id: expenseData._id,
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date ? new Date(expenseData.date).toISOString().split('T')[0] : '',
          type: expenseData.type,
          paymentMethod: expenseData.paymentMethod || 'Credit Card',
          notes: expenseData.notes || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load expense');
      }
    };
    fetchExpense();
  }, [id, navigate]);

  return (
    <div className="add-expense-page">
      <div className="page-header">
        <h1>Edit Expense</h1>
        <p>Modify existing transaction details.</p>
      </div>

      <Card>
        {error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>
        ) : isExpired ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>Editing is only allowed within 24 hours of creating this expense.</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Redirecting to Expense History...</p>
          </div>
        ) : expense ? (
          <ExpenseForm initialData={expense} isEdit={true} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading expense details...</div>
        )}
      </Card>
    </div>
  );
};

export default EditExpense;
