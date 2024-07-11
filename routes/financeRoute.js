const express = require('express');
const router = express.Router();
const Revenue = require('../models/revenueModel');
const Expense = require('../models/expenseModel');

// Add revenue
router.post('/revenues', async (req, res) => {
  const { date, amount, description } = req.body;
  const newRevenue = new Revenue({ date, amount, description });
  try {
    const savedRevenue = await newRevenue.save();
    res.status(201).json(savedRevenue);
  } catch (error) {
    res.status(500).json({ message: 'Error adding revenue', error });
  }
});

// Add expense
router.post('/expenses', async (req, res) => {
  const { date, amount, description } = req.body;
  const newExpense = new Expense({ date, amount, description });
  try {
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error });
  }
});

// Get all revenues
router.get('/revenues', async (req, res) => {
  try {
    const revenues = await Revenue.find();
    res.json(revenues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenues', error });
  }
});

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
});

// Delete revenue
router.delete('/revenues/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).send('Expense not found');
    }
    res.status(200).send('Expense deleted successfully');
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).send('Error deleting expense');
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).send('Expense not found');
    }
    res.status(200).send('Expense deleted successfully');
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).send('Error deleting expense');
  }
});

module.exports = router;
