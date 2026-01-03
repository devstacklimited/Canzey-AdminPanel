import React from 'react';
import { X } from 'lucide-react';
import './PromoModal.css';

const PromoModal = ({
  show,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  loading,
  isEditing
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content promo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Content' : 'Create New Content'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit} className="modal-body">
          <div className="form-group">
            <label>Key Name *</label>
            <input
              type="text"
              name="key_name"
              value={formData.key_name}
              onChange={onInputChange}
              placeholder="e.g., home_welcome_banner"
              required
              disabled={isEditing}
            />
            <small className="form-hint">
              Unique identifier for this content. Use lowercase with underscores.
              {isEditing && ' (Cannot be changed after creation)'}
            </small>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              placeholder="e.g., Welcome Offer"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows="4"
              placeholder="Enter the promotional text or content that will be displayed in the app..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Content Type *</label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={onInputChange}
                required
              >
                <option value="promo">Promo</option>
                <option value="ad">Ad</option>
                <option value="notification">Notification</option>
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={onInputChange}
              min="0"
              placeholder="0"
            />
            <small className="form-hint">
              Higher priority content appears first (0 = lowest)
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date (Optional)</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={onInputChange}
              />
            </div>

            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={onInputChange}
              />
            </div>
          </div>

          <div className="info-box">
            <strong>💡 How to use in Flutter:</strong>
            <code>GET /api/content/key/{formData.key_name || 'your_key_name'}</code>
            <p>Or fetch all active content by type:</p>
            <code>GET /api/content/type/{formData.content_type}</code>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Content' : 'Create Content')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoModal;
