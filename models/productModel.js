const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  field: { type: String },
  oldValue: { type: String },
  newValue: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const clicheSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ref: { type: String, required: true },
  location: { type: String, required: true },
  processedQuantity: { type: Number, required: true },
  shippedQuantity: { type: Number, required: true },
  history: [historySchema],
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  arrivalDate: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
  weight: { type: Number, required: true },
  measurementUnit: { type: String, required: true },
  processedQuantity: { type: Number, default: 0 },
  clicheReferences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cliche' }],
  history: [historySchema],
});

const Product = mongoose.model('Product', productSchema);
const Cliche = mongoose.model('Cliche', clicheSchema);

module.exports = { Product, Cliche };
