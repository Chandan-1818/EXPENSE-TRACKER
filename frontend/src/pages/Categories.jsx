import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Tooltip from '../components/Tooltip';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import api from '../api/axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import './Categories.css';

const Categories = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  // Fetch categories using TanStack Query
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setName('');
    setColor('#6366f1');
    setIsModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color || '#6366f1');
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (cat) => {
    setDeletingCategory(cat);
    setIsConfirmOpen(true);
  };

  // Save category mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory._id}`, data);
        return res.data.data;
      } else {
        const res = await api.post('/categories', data);
        return res.data.data;
      }
    },
    onSuccess: () => {
      showToast(editingCategory ? 'Category updated successfully' : 'Category added successfully');
      setIsModalOpen(false);
      // Invalidate categories query to refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to save category', 'error');
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      showToast('Category deleted successfully');
      setIsConfirmOpen(false);
      // Invalidate categories query to refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate({ name, color });
  };

  const handleDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory._id);
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <p>Manage your expense and income categories.</p>
      </div>

      <Card className="categories-card">
        <div className="categories-toolbar">
          <div className="search-box">
            <Input 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button variant="primary" onClick={handleAddCategory}>
            <MdAdd /> Add Category
          </Button>
        </div>

        <div className="categories-grid">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="category-item" style={{ border: 'none', padding: '1rem 0' }}>
                <Skeleton width="100%" height="40px" />
              </div>
            ))
          ) : currentCategories.length > 0 ? (
            <>
              {currentCategories.map(cat => (
                <div key={cat._id} className="category-item">
                  <div className="category-info">
                    <div className="category-color" style={{ backgroundColor: cat.color }}></div>
                    <span className="category-name">{cat.name}</span>
                  </div>
                  <div className="category-actions">
                    <Tooltip content="Edit category">
                      <button className="action-btn edit" onClick={() => handleEditCategory(cat)}><MdEdit /></button>
                    </Tooltip>
                    <Tooltip content="Delete category">
                      <button className="action-btn delete" onClick={() => handleDeletePrompt(cat)}><MdDelete /></button>
                    </Tooltip>
                  </div>
                </div>
              ))}
              {totalPages > 1 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState 
              title="No categories found"
              description="Try adjusting your search term or add a new category."
              action={{ label: "Add Category", onClick: handleAddCategory }}
            />
          )}
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSave} className="category-form">
          <Input 
            label="Category Name" 
            placeholder="e.g. Subscriptions" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
          <div className="color-picker-group">
            <label className="input-label">Color Code</label>
            <div className="color-input-wrapper">
              <input 
                type="color" 
                className="color-picker" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <Input 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-text-input"
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>Save Category</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete <strong>{deletingCategory?.name}</strong>? All related expenses will remain but lose this category tag.
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

export default Categories;
