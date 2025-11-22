import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import CampaignDetailModal from '../../components/CampaignDetailModal/CampaignDetailModal';
import { Plus, Eye } from 'lucide-react';
import './Campaigns.css';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticket_price: '',
    credits_per_ticket: '',
    max_tickets_per_user: '',
    status: 'active',
    start_at: '',
    end_at: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      } else {
        console.error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCampaign 
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : '/api/admin/campaigns';
      
      const method = editingCampaign ? 'PUT' : 'POST';
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('ticket_price', parseFloat(formData.ticket_price));
      formDataToSend.append('credits_per_ticket', parseInt(formData.credits_per_ticket));
      formDataToSend.append('max_tickets_per_user', formData.max_tickets_per_user ? parseInt(formData.max_tickets_per_user) : '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('start_at', formData.start_at || '');
      formDataToSend.append('end_at', formData.end_at || '');
      
      // Add image file if selected
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchCampaigns();
        setShowModal(false);
        setEditingCampaign(null);
        setFormData({
          title: '',
          description: '',
          ticket_price: '',
          credits_per_ticket: '',
          max_tickets_per_user: '',
          status: 'active',
          start_at: '',
          end_at: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign');
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      ticket_price: campaign.ticket_price.toString(),
      credits_per_ticket: campaign.credits_per_ticket.toString(),
      max_tickets_per_user: campaign.max_tickets_per_user?.toString() || '',
      status: campaign.status,
      start_at: campaign.start_at ? new Date(campaign.start_at).toISOString().slice(0, 16) : '',
      end_at: campaign.end_at ? new Date(campaign.end_at).toISOString().slice(0, 16) : ''
    });
    setSelectedImage(null);
    setImagePreview(campaign.image_url || null);
    setShowModal(true);
  };

  const handleDelete = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchCampaigns();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign');
    }
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      title: '',
      description: '',
      ticket_price: '',
      credits_per_ticket: '',
      max_tickets_per_user: '',
      status: 'active',
      start_at: '',
      end_at: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      inactive: 'status-inactive',
      closed: 'status-closed'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCampaign(null);
  };

  const handleEditFromDetail = (campaign) => {
    setShowDetailModal(false);
    handleEdit(campaign);
  };

  const handleDeleteFromDetail = async (campaignId) => {
    setShowDetailModal(false);
    await handleDelete(campaignId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="campaigns-container">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="campaigns-container">
      <div className="campaigns-header">
        <h1>Campaign Management</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          Create New Campaign
        </button>
      </div>

      <div className="campaigns-table-container">
        <table className="campaigns-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <div className="campaign-title-cell">
                    <strong>{campaign.title}</strong>
                    <div className="campaign-subtitle">ID: {campaign.id}</div>
                  </div>
                </td>
                <td>{campaign.start_at ? new Date(campaign.start_at).toLocaleDateString() : 'No limit'}</td>
                <td>{campaign.end_at ? new Date(campaign.end_at).toLocaleDateString() : 'No limit'}</td>
                <td>{getStatusBadge(campaign.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewDetails(campaign)}
                      title="View Details"
                    >
                      <Eye size={14} />
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {campaigns.length === 0 && (
          <div className="no-campaigns">
            <p>No campaigns found. Create your first campaign!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="campaign-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Campaign Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Campaign preview" 
                      className="form-image-preview"
                    />
                    {selectedImage && (
                      <p className="file-info">
                        Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ticket_price">Ticket Price ($) *</label>
                  <input
                    type="number"
                    id="ticket_price"
                    name="ticket_price"
                    value={formData.ticket_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="credits_per_ticket">Credits per Ticket *</label>
                  <input
                    type="number"
                    id="credits_per_ticket"
                    name="credits_per_ticket"
                    value={formData.credits_per_ticket}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="max_tickets_per_user">Max Tickets per User</label>
                  <input
                    type="number"
                    id="max_tickets_per_user"
                    name="max_tickets_per_user"
                    value={formData.max_tickets_per_user}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_at">Start Date</label>
                  <input
                    type="datetime-local"
                    id="start_at"
                    name="start_at"
                    value={formData.start_at}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_at">End Date</label>
                  <input
                    type="datetime-local"
                    id="end_at"
                    name="end_at"
                    value={formData.end_at}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
      </div>
    </Layout>
  );
};

export default Campaigns;
