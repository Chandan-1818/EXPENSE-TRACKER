import React from 'react';
import Card from '../components/Card';
import ExpenseForm from '../components/ExpenseForm';
import './AddExpense.css'; // Just for standard page headers if needed

const AddExpense = () => {
  return (
    <div className="add-expense-page">
      <div className="page-header">
        <h1>Add New Expense</h1>
        <p>Record a new transaction manually.</p>
      </div>

      <Card>
        <ExpenseForm />
      </Card>
    </div>
  );
};

export default AddExpense;
