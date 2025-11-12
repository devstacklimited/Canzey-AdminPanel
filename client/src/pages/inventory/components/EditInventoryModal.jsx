import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Hash, Tag } from 'lucide-react';
import './Modal.css';

const EditInventoryModal = ({ item, onClose, categories }) => {
  // Default categories if none are loaded
  const defaultCategories = [
    { id: 1, name: 'T-Shirts' },
    { id: 2, name: 'Men T-Shirts' },
    { id: 3, name: 'Women T-Shirts' },
    { id: 4, name: 'Kids T-Shirts' },
    { id: 5, name: 'Promotional' }
  ];
  
  const categoriesList = categories && categories.length > 0 ? categories : defaultCategories;
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    brand: '',
    style: '',
    material: '',
    fit_type: 'regular',
    cost_price: '',
    selling_price: '',
    discount_price: '',
    total_quantity: 0,
    minimum_stock_level: 5,
    status: 'active',
    is_featured: false,
    is_visible: true,
    category: '',
    tags: [],
    images: [],
    thumbnail_url: ''
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Initialize form with item data when component mounts
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        brand: item.brand || '',
        style: item.style || '',
        material: item.material || '',
        fit_type: item.fit_type || 'regular',
        cost_price: item.cost_price || '',
        selling_price: item.selling_price || '',
        discount_price: item.discount_price || '',
        total_quantity: item.total_quantity || 0,
        minimum_stock_level: item.minimum_stock_level || 5,
        status: item.status || 'active',
        is_featured: item.is_featured || false,
        is_visible: item.is_visible !== false,
        category: item.category || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        images: Array.isArray(item.images) ? item.images : [],
        thumbnail_url: item.thumbnail_url || ''
      });
      setImagePreviews(Array.isArray(item.images) ? item.images : []);
    }
  }, [item]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target.result;
          setImagePreviews(prev => [...prev, imageUrl]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl],
            thumbnail_url: prev.thumbnail_url || imageUrl
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newThumbnail = newImages.length > 0 ? newImages[0] : '';
      return {
        ...prev,
        images: newImages,
        thumbnail_url: prev.thumbnail_url === prev.images[index] ? newThumbnail : prev.thumbnail_url
      };
    });
  };

  const setAsThumbnail = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      thumbnail_url: imageUrl
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
      // Ensure available_quantity is updated when total_quantity changes
      const updateData = {
        ...formData,
        available_quantity: formData.total_quantity
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        onClose();
      } else {
        alert('Failed to update t-shirt');
      }
    } catch (error) {
      console.error('Error updating t-shirt:', error);
      alert('Error updating t-shirt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit T-Shirt</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              {/* Image Upload */}
              <div className="form-group">
                <label>Product Images</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="image-upload-label">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      <p>Click to upload images</p>
                      <span>PNG, JPG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="image-previews">
                    <div className="previews-header">
                      <span>Images ({imagePreviews.length})</span>
                      <small>Click an image to set as thumbnail</small>
                    </div>
                    <div className="previews-grid">
                      {imagePreviews.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`}
                            className={`preview-image ${formData.thumbnail_url === image ? 'is-thumbnail' : ''}`}
                            onClick={() => setAsThumbnail(image)}
                          />
                          {formData.thumbnail_url === image && (
                            <div className="thumbnail-badge">⭐ Thumbnail</div>
                          )}
                          <button 
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
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
                  rows={3}
                />
              </div>

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
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags (press Enter)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className="tag-add-btn">
                    <Tag size={16} />
                  </button>
                </div>
                <div className="tag-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="tag-remove-btn">×</button>
                    </span>
                  ))}
                </div>
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

              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Discount Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => handleInputChange('discount_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Quantity *</label>
                  <input
                    type="number"
                    value={formData.total_quantity}
                    onChange={(e) => handleInputChange('total_quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    value={formData.minimum_stock_level}
                    onChange={(e) => handleInputChange('minimum_stock_level', parseInt(e.target.value) || 0)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Visibility</label>
                  <select
                    value={formData.is_visible ? 'visible' : 'hidden'}
                    onChange={(e) => handleInputChange('is_visible', e.target.value === 'visible')}
                  >
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  />
                  Featured Item
                </label>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating...' : 'Update T-Shirt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryModal;
