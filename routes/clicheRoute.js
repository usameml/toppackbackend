const express = require('express');
const router = express.Router();
const { Cliche, Product } = require('../models/productModel');

// Middleware to track changes
const trackClicheChanges = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    ref,
    location,
    processedQuantity,
    shippedQuantity,
  } = req.body;

  try {
    const cliche = await Cliche.findById(id);
    if (!cliche) {
      return res.status(404).send('Cliche not found');
    }

    req.changes = [];
    const fields = [
      'name',
      'ref',
      'location',
      'processedQuantity',
      'shippedQuantity',
    ];

    fields.forEach((field) => {
      if (JSON.stringify(cliche[field]) !== JSON.stringify(req.body[field])) {
        req.changes.push({
          field,
          oldValue: JSON.stringify(cliche[field]),
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
router.delete('/:clicheId/history/:historyId', async (req, res) => {
  const { clicheId, historyId } = req.params;
  try {
    const cliche = await Cliche.findById(clicheId);
    if (!cliche) {
      console.error(`Cliche with ID ${clicheId} not found`);
      return res.status(404).send('Cliche not found');
    }

    const historyRecord = cliche.history.id(historyId);
    if (!historyRecord) {
      console.error(`History record with ID ${historyId} not found in cliche ${clicheId}`);
      return res.status(404).send('History record not found');
    }

    // Remove the history record
    cliche.history.pull(historyId);
    await cliche.save();

    res.status(200).json(cliche.history);
  } catch (error) {
    console.error('Error deleting history record:', error);
    res.status(500).send('Error deleting history record');
  }
});


// Cliche Routes
router.get('/', async (req, res) => {
  try {
    const cliches = await Cliche.find();
    res.json(cliches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:productId', async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    ref,
    location,
    processedQuantity,
    shippedQuantity,
  } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const newCliche = new Cliche({
      name,
      ref,
      location,
      processedQuantity,
      shippedQuantity,
      productId: product._id,
    });

    const savedCliche = await newCliche.save();

    product.clicheReferences.push(savedCliche._id);
    await product.save();

    res.status(201).json(savedCliche);
  } catch (error) {
    console.error('Error adding cliche:', error);
    res.status(500).json({ message: 'Error adding cliche', error });
  }
});

router.put('/:id', trackClicheChanges, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    ref,
    location,
    processedQuantity,
    shippedQuantity,
  } = req.body;

  if (!name || !ref || !location || processedQuantity == null || shippedQuantity == null) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  try {
    const updatedCliche = await Cliche.findByIdAndUpdate(
      id,
      {
        name,
        ref,
        location,
        processedQuantity,
        shippedQuantity,
      },
      { new: true }
    );

    if (!updatedCliche) {
      return res.status(404).send('Cliche not found');
    }

    if (req.changes.length > 0) {
      updatedCliche.history.push(...req.changes);
      await updatedCliche.save();
    }

    res.status(200).json(updatedCliche);
  } catch (error) {
    console.error('Error updating cliche:', error);
    res.status(500).send('Error updating cliche');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Cliche.findByIdAndDelete(id);
    res.status(200).send('Cliche deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting cliche');
  }
});

module.exports = router;
