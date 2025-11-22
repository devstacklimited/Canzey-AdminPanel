import React, { useState, useEffect } from 'react';
import { X, Edit, Calendar, DollarSign, Award, Users, Image as ImageIcon } from 'lucide-react';
import './CampaignDetailModal.css';

const CampaignDetailModal = ({ campaign, isOpen, onClose, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No limit';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      inactive: 'status-inactive',
      closed: 'status-closed'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-modal-header">
          <h2>{campaign.title}</h2>
          <div className="detail-modal-actions">
            <button 
              className="btn-edit-detail" 
              onClick={() => onEdit(campaign)}
              title="Edit Campaign"
            >
              <Edit size={16} />
            </button>
            <button 
              className="detail-modal-close" 
              onClick={onClose}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="detail-modal-content">
          {/* Campaign Image */}
          <div className="detail-image-section">
            {campaign.image_url && !imageError ? (
              <img 
                src={campaign.image_url} 
                alt={campaign.title}
                className="detail-campaign-image"
                onError={handleImageError}
              />
            ) : (
              <div className="detail-no-image">
                <ImageIcon size={48} />
                <p>No Image</p>
              </div>
            )}
          </div>

          {/* Campaign Info */}
          <div className="detail-info-section">
            <div className="detail-info-grid">
              {/* Status */}
              <div className="detail-info-item">
                <div className="detail-info-label">Status</div>
                <div className="detail-info-value">
                  {getStatusBadge(campaign.status)}
                </div>
              </div>

              {/* Ticket Price */}
              <div className="detail-info-item">
                <div className="detail-info-label">
                  <DollarSign size={16} />
                  Ticket Price
                </div>
                <div className="detail-info-value">${campaign.ticket_price}</div>
              </div>

              {/* Credits per Ticket */}
              <div className="detail-info-item">
                <div className="detail-info-label">
                  <Award size={16} />
                  Credits per Ticket
                </div>
                <div className="detail-info-value">{campaign.credits_per_ticket}</div>
              </div>

              {/* Max Tickets */}
              <div className="detail-info-item">
                <div className="detail-info-label">
                  <Users size={16} />
                  Max Tickets per User
                </div>
                <div className="detail-info-value">
                  {campaign.max_tickets_per_user || 'Unlimited'}
                </div>
              </div>

              {/* Start Date */}
              <div className="detail-info-item">
                <div className="detail-info-label">
                  <Calendar size={16} />
                  Start Date
                </div>
                <div className="detail-info-value">{formatDate(campaign.start_at)}</div>
              </div>

              {/* End Date */}
              <div className="detail-info-item">
                <div className="detail-info-label">
                  <Calendar size={16} />
                  End Date
                </div>
                <div className="detail-info-value">{formatDate(campaign.end_at)}</div>
              </div>
            </div>

            {/* Description */}
            {campaign.description && (
              <div className="detail-description">
                <div className="detail-info-label">Description</div>
                <div className="detail-description-text">{campaign.description}</div>
              </div>
            )}

            {/* Timestamps */}
            <div className="detail-timestamps">
              <div className="detail-timestamp">
                <span>Created:</span> {formatDate(campaign.created_at)}
              </div>
              {campaign.updated_at !== campaign.created_at && (
                <div className="detail-timestamp">
                  <span>Updated:</span> {formatDate(campaign.updated_at)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="detail-modal-footer">
          <button 
            className="btn-delete-detail" 
            onClick={() => onDelete(campaign.id)}
          >
            Delete Campaign
          </button>
          <button 
            className="btn-edit-primary" 
            onClick={() => onEdit(campaign)}
          >
            <Edit size={16} />
            Edit Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailModal;
