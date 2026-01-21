import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import '../../../components/ui/ToggleSwitch.css';
import './BannerModal.css';

const BannerModal = ({ banner, formData, setFormData, onSave, onClose }) => {
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!banner && !formData.image) newErrors.image = 'Image is required';
    if (formData.width < 100) newErrors.width = 'Width must be at least 100px';
    if (formData.height < 100) newErrors.height = 'Height must be at least 100px';
    if (formData.priority < 0) newErrors.priority = 'Priority must be 0 or higher';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content banner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{banner ? 'Edit Banner' : 'Create New Banner'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="banner-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Banner Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Big Sale, New Arrival"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Banner Image *</label>
            <div className="image-upload-container">
              {formData.imagePreview ? (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="btn-change-image"
                    onClick={() => document.getElementById('imageInput').click()}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div
                  className="upload-area"
                  onClick={() => document.getElementById('imageInput').click()}
                >
                  <Upload size={32} />
                  <p>Click to upload banner image</p>
                  <span>Recommended: {formData.width}x{formData.height}px</span>
                </div>
              )}
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          {/* Resolution Settings */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="width">Width (px) *</label>
              <input
                type="number"
                id="width"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                min="100"
                className={errors.width ? 'error' : ''}
              />
              {errors.width && <span className="error-message">{errors.width}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="height">Height (px) *</label>
              <input
                type="number"
                id="height"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                min="100"
                className={errors.height ? 'error' : ''}
              />
              {errors.height && <span className="error-message">{errors.height}</span>}
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority">Priority (Display Order)</label>
            <input
              type="number"
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              min="0"
              className={errors.priority ? 'error' : ''}
            />
            <small>Higher number = shown first</small>
            {errors.priority && <span className="error-message">{errors.priority}</span>}
          </div>

          {/* Link URL */}
          <div className="form-group">
            <label htmlFor="linkUrl">Link URL (Optional)</label>
            <input
              type="url"
              id="linkUrl"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="https://example.com/promo"
            />
            <small>Where users go when they tap the banner</small>
          </div>

          {/* Active Status */}
          <div className="form-group">
            <label htmlFor="isActive">Status</label>
            <div className="toggle-wrapper">
              <input
                type="checkbox"
                id="isActive"
                className="toggle-checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="isActive" className="toggle-label">
                {formData.is_active ? 'Active' : 'Inactive'}
              </label>
            </div>
            <small>Inactive banners won't be shown on the app</small>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;
