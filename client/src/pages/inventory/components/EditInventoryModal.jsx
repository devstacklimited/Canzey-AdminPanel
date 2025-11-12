import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const EditInventoryModal = ({ item, onClose, categories }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit T-Shirt: {item.name}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <p>Edit functionality coming soon...</p>
          <p>Item ID: {item.id}</p>
          <p>SKU: {item.sku}</p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryModal;
