const express = require('express');
const router = express.Router();
const { Product } = require('../models/productModel');

// Middleware to track changes
const trackChanges = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    location,
    arrivalDate,
    quantity,
    weight,
    measurementUnit,
    processedQuantity,
    shippedQuantity,
    clicheReferences,
    selectedClicheReference,
  } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    req.changes = [];
    const fields = [
      'name',
      'location',
      'arrivalDate',
      'quantity',
      'weight',
      'measurementUnit',
      'processedQuantity',
      'shippedQuantity',
      'clicheReferences',
      'selectedClicheReference',
    ];

    fields.forEach((field) => {
      if (JSON.stringify(product[field]) !== JSON.stringify(req.body[field])) {
        req.changes.push({
          field,
          oldValue: JSON.stringify(product[field]),
          newValue: JSON.stringify(req.body[field]),
          updatedAt: new Date(),
        });
      }
    });

    next();
  } catch (error) {
    console.error('Error tracking changes:', error);
    res.status(500).send('Error tracking changes');
  }
};

// Delete a specific history record
router.delete('/:productId/history/:historyId', async (req, res) => {
  const { productId, historyId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      return res.status(404).send('Product not found');
    }

    const historyRecord = product.history.id(historyId);
    if (!historyRecord) {
      console.error(`History record with ID ${historyId} not found in product ${productId}`);
      return res.status(404).send('History record not found');
    }

    // Remove the history record
    product.history.pull(historyId);
    await product.save();

    res.status(200).json(product.history);
  } catch (error) {
    console.error('Error deleting history record:', error);
    res.status(500).send('Error deleting history record');
  }
});

// List products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product
router.post('/', async (req, res) => {
  const { 
    name,
    location,
    arrivalDate,
    quantity,
    weight,
    measurementUnit,
    processedQuantity,
    shippedQuantity,
    clicheReferences,
  } = req.body;

  try {
    const newProduct = new Product({
      name,
      location,
      arrivalDate,
      quantity,
      weight,
      measurementUnit,
      processedQuantity,
      shippedQuantity,
      clicheReferences,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
});

// Update product
router.put('/:id', trackChanges, async (req, res) => {
  const { id } = req.params;
  const { 
    name,
    location,
    arrivalDate,
    quantity,
    weight,
    measurementUnit,
    processedQuantity,
    shippedQuantity,
    clicheReferences,
    selectedClicheReference
  } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        location,
        arrivalDate,
        quantity,
        weight,
        measurementUnit,
        processedQuantity,
        shippedQuantity,
        clicheReferences,
        selectedClicheReference
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }

    // Add history
    if (req.changes.length > 0) {
      updatedProduct.history.push(...req.changes);
      await updatedProduct.save();
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Error updating product');
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.status(200).send('Product deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting product');
  }
});

module.exports = router;
