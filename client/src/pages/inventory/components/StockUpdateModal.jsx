import React, { useState } from 'react';
import { X, Package, Plus, Minus } from 'lucide-react';
import './Modal.css';

const StockUpdateModal = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(item.available_quantity);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${item.id}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          reason: reason || 'Stock adjustment'
        })
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    } finally {
      setLoading(false);
    }
  };

  const adjustQuantity = (adjustment) => {
    const newQuantity = Math.max(0, quantity + adjustment);
    setQuantity(newQuantity);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Update Stock: {item.name}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="stock-info">
            <div className="current-stock">
              <Package size={24} />
              <div>
                <span className="stock-label">Current Stock</span>
                <span className="stock-value">{item.available_quantity}</span>
              </div>
            </div>
            
            <div className="stock-status">
              <span className="stock-label">Status</span>
              <span className={`stock-badge ${
                item.available_quantity === 0 ? 'out-of-stock' :
                item.available_quantity <= item.minimum_stock_level ? 'low-stock' : 'in-stock'
              }`}>
                {item.available_quantity === 0 ? 'Out of Stock' :
                 item.available_quantity <= item.minimum_stock_level ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>New Quantity</label>
            <div className="quantity-input">
              <button 
                type="button" 
                onClick={() => adjustQuantity(-1)}
                className="quantity-btn"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="0"
                className="quantity-field"
              />
              <button 
                type="button" 
                onClick={() => adjustQuantity(1)}
                className="quantity-btn"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Change</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., New shipment, Damaged items, Sale adjustment"
            />
          </div>

          <div className="change-summary">
            <div className="change-item">
              <span>Change:</span>
              <span className={quantity > item.available_quantity ? 'positive' : 'negative'}>
                {quantity > item.available_quantity ? '+' : ''}{quantity - item.available_quantity}
              </span>
            </div>
            <div className="change-item">
              <span>New Total:</span>
              <span>{quantity}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
