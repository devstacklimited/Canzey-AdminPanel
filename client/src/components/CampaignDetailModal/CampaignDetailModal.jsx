import React, { useState, useEffect } from 'react';
import { X, Edit, Calendar, Image as ImageIcon, Package, Ticket } from 'lucide-react';
import { getImageUrl } from '../../config/api';
import './CampaignDetailModal.css';

const CampaignDetailModal = ({ campaign, isOpen, onClose, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [productPrizes, setProductPrizes] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setImageError(false);
    if (campaign && isOpen) {
      fetchProductPrizes();
    }
  }, [campaign, isOpen]);

  const fetchProductPrizes = async () => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/product-prizes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter products for this specific campaign
        const campaignProducts = data.product_prizes.filter(pp => pp.campaign_id === campaign.id);
        setProductPrizes(campaignProducts);
      }
    } catch (error) {
      console.error('Error fetching product prizes:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

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
              title="Edit Prize"
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
          {/* Prize Images */}
          <div className="detail-image-section">
            {/* Show all images if available */}
            {campaign.images && campaign.images.length > 0 ? (
              <div className="detail-images-gallery">
                {campaign.images.map((img, index) => (
                  <img 
                    key={img.id || index}
                    src={getImageUrl(img.image_url)} 
                    alt={`${campaign.title} ${index + 1}`}
                    className="detail-campaign-image"
                  />
                ))}
              </div>
            ) : campaign.image_url && !imageError ? (
              <img 
                src={getImageUrl(campaign.image_url)} 
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
                <div className="detail-info-label">Prize Description</div>
                <div className="detail-description-text">{campaign.description}</div>
              </div>
            )}

            {/* Attached Products */}
            <div className="detail-products-section">
              <div className="detail-info-label">
                <Package size={16} />
                Attached Products ({productPrizes.length})
              </div>
              
              {loadingProducts ? (
                <div className="detail-loading">Loading products...</div>
              ) : productPrizes.length === 0 ? (
                <div className="detail-no-products">
                  <Package size={32} />
                  <p>No products attached to this prize yet</p>
                </div>
              ) : (
                <div className="detail-products-categories">
                  {/* Active Products */}
                  {productPrizes.filter(pp => pp.tickets_remaining > 0 && (!pp.end_date || new Date(pp.end_date) > new Date())).length > 0 && (
                    <div className="product-category-group">
                      <h4 className="product-category-title active-category">Active Products</h4>
                      <div className="detail-products-grid">
                        {productPrizes
                          .filter(pp => pp.tickets_remaining > 0 && (!pp.end_date || new Date(pp.end_date) > new Date()))
                          .map((productPrize) => (
                          <div key={productPrize.id} className="detail-product-card">
                            <div className="detail-product-header">
                              {productPrize.main_image_url ? (
                                <img 
                                  src={getImageUrl(productPrize.main_image_url)} 
                                  alt={productPrize.product_name}
                                  className="detail-product-image"
                                />
                              ) : (
                                <div className="detail-product-no-image">
                                  <Package size={24} />
                                </div>
                              )}
                              <div className="detail-product-info">
                                <h4>{productPrize.product_name}</h4>
                                <span className={`detail-product-status ${productPrize.is_active ? 'active' : 'inactive'}`}>
                                  {productPrize.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="detail-product-tickets">
                              <div className="detail-ticket-info">
                                <div className="detail-ticket-label">
                                  <Ticket size={14} />
                                  Ticket Progress
                                </div>
                                <div className="detail-ticket-stats">
                                  <span className="ticket-sold">{productPrize.tickets_sold}</span>
                                  <span className="ticket-separator">/</span>
                                  <span className="ticket-total">{productPrize.tickets_required}</span>
                                </div>
                              </div>
                              
                              <div className="detail-ticket-progress">
                                <div className="ticket-progress-bar">
                                  <div 
                                    className="ticket-progress-fill" 
                                    style={{ 
                                      width: `${Math.min((productPrize.tickets_sold / productPrize.tickets_required) * 100, 100)}%` 
                                    }}
                                  />
                                </div>
                                <div className="ticket-progress-text">
                                  {productPrize.tickets_remaining} tickets remaining
                                </div>
                              </div>
                              
                              {productPrize.countdown_start_tickets > 0 && (
                                <div className="detail-countdown-info">
                                  <small>
                                    Countdown starts after {productPrize.countdown_start_tickets} tickets sold
                                  </small>
                                </div>
                              )}
                              
                              {productPrize.draw_date && (
                                <div className="detail-draw-date-info">
                                  <div className="detail-info-label">
                                    <Calendar size={12} />
                                    Draw Date: {formatDate(productPrize.draw_date)}
                                  </div>
                                </div>
                              )}

                              {productPrize.end_date && (
                                <div className="detail-draw-date-info detail-end-date-info">
                                  <div className="detail-info-label">
                                    <Calendar size={12} />
                                    🔴 Prize Ends: {formatDate(productPrize.end_date)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sold Out / Expired Products */}
                  {productPrizes.filter(pp => pp.tickets_remaining <= 0 || (pp.end_date && new Date(pp.end_date) <= new Date())).length > 0 && (
                    <div className="product-category-group completed-group">
                      <h4 className="product-category-title completed-category">Sold Out / Ended</h4>
                      <div className="detail-products-grid">
                        {productPrizes
                          .filter(pp => pp.tickets_remaining <= 0 || (pp.end_date && new Date(pp.end_date) <= new Date()))
                          .map((productPrize) => (
                          <div key={productPrize.id} className="detail-product-card completed-card">
                            <div className="detail-product-header">
                              {productPrize.main_image_url ? (
                                <img 
                                  src={getImageUrl(productPrize.main_image_url)} 
                                  alt={productPrize.product_name}
                                  className="detail-product-image grayscale"
                                />
                              ) : (
                                <div className="detail-product-no-image">
                                  <Package size={24} />
                                </div>
                              )}
                              <div className="detail-product-info">
                                <h4>{productPrize.product_name}</h4>
                                <span className="detail-product-status completed">
                                  {productPrize.tickets_remaining <= 0 ? 'Sold Out' : 'Ended'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="detail-product-tickets">
                              <div className="detail-ticket-info">
                                <div className="detail-ticket-label">
                                  <Ticket size={14} />
                                  Ticket Progress
                                </div>
                                <div className="detail-ticket-stats">
                                  <span className="ticket-sold">{productPrize.tickets_sold}</span>
                                  <span className="ticket-separator">/</span>
                                  <span className="ticket-total">{productPrize.tickets_required}</span>
                                </div>
                              </div>
                              
                              <div className="detail-ticket-progress">
                                <div className="ticket-progress-bar completed">
                                  <div 
                                    className="ticket-progress-fill gray" 
                                    style={{ 
                                      width: '100%' 
                                    }}
                                  />
                                </div>
                                <div className="ticket-progress-text">
                                  {productPrize.tickets_remaining <= 0 ? 'Selection Pending / Done' : 'Prize Period Ended'}
                                </div>
                              </div>
                              
                              {productPrize.draw_date && (
                                <div className="detail-draw-date-info">
                                  <div className="detail-info-label">
                                    <Calendar size={12} />
                                    Draw Date: {formatDate(productPrize.draw_date)}
                                  </div>
                                </div>
                              )}

                              {productPrize.end_date && (
                                <div className="detail-draw-date-info detail-end-date-info">
                                  <div className="detail-info-label">
                                    <Calendar size={12} />
                                    🔴 Prize Ended: {formatDate(productPrize.end_date)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

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
            Delete Prize
          </button>
          <button 
            className="btn-edit-primary" 
            onClick={() => onEdit(campaign)}
          >
            <Edit size={16} />
            Edit Prize
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailModal;
