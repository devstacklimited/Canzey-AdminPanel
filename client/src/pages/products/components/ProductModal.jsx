import React from 'react';
import { X, Package, Trash2 } from 'lucide-react';
import './ProductModal.css';

const ProductModal = ({
  show,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  existingImages,
  imagePreviews,
  selectedImages,
  onImageChange,
  onRemoveExistingImage,
  onRemoveNewImage,
  loading,
  isEditing,
  onDelete
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Create Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit} className="modal-body">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={onInputChange}
              />
            </div>

            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={onInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Sale Price</label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={onInputChange}
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={onInputChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category || ''}
              onChange={onInputChange}
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Books">Books</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sub-Category</label>
            <select
              name="sub_category"
              value={formData.sub_category || ''}
              onChange={onInputChange}
            >
              <option value="">Select Sub-Category</option>
              <optgroup label="Clothing">
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Dresses">Dresses</option>
                <option value="Skirts">Skirts</option>
                <option value="Jackets">Jackets</option>
                <option value="Sweaters">Sweaters</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </optgroup>
              <optgroup label="Electronics">
                <option value="Smartphones">Smartphones</option>
                <option value="Laptops">Laptops</option>
                <option value="Tablets">Tablets</option>
                <option value="Headphones">Headphones</option>
                <option value="Cameras">Cameras</option>
                <option value="Smart Watches">Smart Watches</option>
              </optgroup>
              <optgroup label="Home & Garden">
                <option value="Furniture">Furniture</option>
                <option value="Decor">Decor</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bedding">Bedding</option>
                <option value="Garden Tools">Garden Tools</option>
              </optgroup>
              <optgroup label="Sports">
                <option value="Gym Equipment">Gym Equipment</option>
                <option value="Outdoor Gear">Outdoor Gear</option>
                <option value="Sports Apparel">Sports Apparel</option>
              </optgroup>
              <optgroup label="Other">
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Beauty">Beauty</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </optgroup>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>For</label>
              <select
                name="for_gender"
                value={formData.for_gender || ''}
                onChange={onInputChange}
              >
                <option value="">Select</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>Customization</label>
              <div className="custom-checkbox">
                <input
                  type="checkbox"
                  id="is_customized"
                  name="is_customized"
                  checked={formData.is_customized || false}
                  onChange={(e) => onInputChange({
                    target: {
                      name: 'is_customized',
                      value: e.target.checked
                    }
                  })}
                />
                <label htmlFor="is_customized" className="checkbox-styled">
                  <span className="checkbox-icon"></span>
                  Is Customized
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Product Images (Max 10)</label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="existing-images">
                <p className="image-section-title">Existing Images</p>
                <div className="image-previews-grid">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={`http://localhost:5000${imageUrl}`} alt={`Existing ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => onRemoveExistingImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="new-images">
                <p className="image-section-title">New Images</p>
                <div className="image-previews-grid">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => onRemoveNewImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Input */}
            <div className="file-input-wrapper">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={onImageChange}
                className="file-input"
              />
              <label htmlFor="image-upload" className="file-input-label">
                <Package size={20} />
                Choose Images from PC
              </label>
              <p className="file-input-hint">
                You can select up to {10 - existingImages.length - selectedImages.length} more images
              </p>
            </div>
          </div>

          <div className="modal-footer">
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-danger mr-auto" 
                onClick={onDelete}
                style={{ marginRight: 'auto', backgroundColor: '#ef4444', color: 'white' }}
              >
                <Trash2 size={18} />
                Delete Product
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
