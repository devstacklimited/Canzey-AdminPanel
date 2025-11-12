import React, { useState } from 'react';
import { X, Package, DollarSign, Hash, Tag } from 'lucide-react';
import './Modal.css';

const AddInventoryModal = ({ onClose, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    brand: '',
    style: '',
    material: '',
    fit_type: 'regular',
    category: '',
    cost_price: '',
    selling_price: '',
    total_quantity: '',
    minimum_stock_level: '5',
    status: 'active',
    is_featured: false,
    is_visible: true,
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
          selling_price: parseFloat(formData.selling_price),
          total_quantity: parseInt(formData.total_quantity),
          minimum_stock_level: parseInt(formData.minimum_stock_level)
        })
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add New T-Shirt</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>
                  <Package size={16} />
                  T-Shirt Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Classic Cotton T-Shirt"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Hash size={16} />
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="e.g., TSH-001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the t-shirt..."
                  rows="3"
                />
              </div>
            </div>

            {/* T-Shirt Details */}
            <div className="form-section">
              <h3>T-Shirt Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="e.g., Nike, Adidas"
                  />
                </div>

                <div className="form-group">
                  <label>Style</label>
                  <input
                    type="text"
                    value={formData.style}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                    placeholder="e.g., Crew Neck, V-Neck"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder="e.g., 100% Cotton"
                  />
                </div>

                <div className="form-group">
                  <label>Fit Type</label>
                  <select
                    value={formData.fit_type}
                    onChange={(e) => handleInputChange('fit_type', e.target.value)}
                  >
                    <option value="regular">Regular</option>
                    <option value="slim">Slim</option>
                    <option value="oversized">Oversized</option>
                    <option value="fitted">Fitted</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="form-section">
              <h3>Pricing & Stock</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <DollarSign size={16} />
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange('cost_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <DollarSign size={16} />
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => handleInputChange('selling_price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Initial Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.total_quantity}
                    onChange={(e) => handleInputChange('total_quantity', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    value={formData.minimum_stock_level}
                    onChange={(e) => handleInputChange('minimum_stock_level', e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="form-section">
              <h3>Tags</h3>
              
              <div className="form-group">
                <label>
                  <Tag size={16} />
                  Add Tags
                </label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag and press Enter"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className="tag-add-btn">
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="tags-display">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add T-Shirt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
