import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './Input';
import CurrencyInput from './CurrencyInput';
import Select from './Select';
import Button from './Button';
import Modal from './Modal';
import Toast from './Toast';
import api from '../api/axios';
import './ExpenseForm.css';

const ExpenseForm = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    type: 'expense',
    paymentMethod: 'Credit Card',
    notes: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        setToast({ isVisible: true, message: 'Failed to fetch categories', type: 'error' });
      }
    };
    
    fetchCategories();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description) newErrors.description = 'Title is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleCancelClick = () => {
    if (formData.description || formData.amount) {
      setIsConfirmModalOpen(true);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (isEdit && formData._id) {
        await api.put(`/expenses/${formData._id}`, formData);
        showToast('Expense updated successfully!', 'success');
      } else {
        await api.post('/expenses', formData);
        showToast('Expense added successfully!', 'success');
      }
      setTimeout(() => navigate('/history'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save expense', 'error');
      setIsLoading(false);
    }
  };

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.name }));
  const paymentOptions = [
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Debit Card', value: 'Debit Card' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank Transfer', value: 'Bank Transfer' }
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-grid">
          <Input 
            label="Expense Title" 
            id="description" 
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="e.g. Groceries"
          />
          <CurrencyInput 
            label="Amount" 
            id="amount"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            placeholder="0.00"
          />
        </div>

        <div className="form-grid">
          <Select 
            label="Category" 
            id="category"
            options={categoryOptions}
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
          />
          <Input 
            label="Date" 
            id="date" 
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
          />
        </div>

        <div className="form-grid">
          <Select 
            label="Payment Method" 
            id="paymentMethod"
            options={paymentOptions}
            value={formData.paymentMethod}
            onChange={handleChange}
          />
          <div className="file-upload-group">
            <label className="input-label">Type</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label>
                <input 
                  type="radio" 
                  name="type" 
                  id="type" 
                  value="expense" 
                  checked={formData.type === 'expense'} 
                  onChange={handleChange} 
                /> Expense
              </label>
              <label>
                <input 
                  type="radio" 
                  name="type" 
                  id="type" 
                  value="income" 
                  checked={formData.type === 'income'} 
                  onChange={handleChange} 
                /> Income
              </label>
            </div>
          </div>
        </div>

        <div className="form-full">
          <label className="input-label" htmlFor="notes">Notes</label>
          <textarea 
            id="notes" 
            className="textarea-field" 
            rows="4" 
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional details..."
          ></textarea>
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={handleCancelClick} type="button">Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </form>

      <Modal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Discard Changes"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          You have unsaved changes. Are you sure you want to discard them?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Keep Editing</Button>
          <Button variant="danger" onClick={() => navigate(-1)}>Discard</Button>
        </div>
      </Modal>

      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
    </>
  );
};

export default ExpenseForm;
