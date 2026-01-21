import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import BannerModal from './components/BannerModal';
import Toast from '../../components/ui/Toast';
import { API_BASE_URL } from '../../config/api';
import './Banners.css';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    imagePreview: '',
    width: 1080,
    height: 400,
    priority: 0,
    is_active: true,
    link_url: ''
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBanners(data.banners || []);
      } else {
        setToast({ type: 'error', message: 'Failed to fetch banners' });
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setToast({ type: 'error', message: 'Error fetching banners' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: null,
      imagePreview: '',
      width: 1080,
      height: 400,
      priority: 0,
      is_active: true,
      link_url: ''
    });
    setShowModal(true);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: null,
      imagePreview: `${API_BASE_URL}${banner.image_url}`,
      width: banner.width,
      height: banner.height,
      priority: banner.priority,
      is_active: banner.is_active,
      link_url: banner.link_url || ''
    });
    setShowModal(true);
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setToast({ type: 'success', message: 'Banner deleted successfully' });
        fetchBanners();
      } else {
        setToast({ type: 'error', message: data.message || 'Failed to delete banner' });
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      setToast({ type: 'error', message: 'Error deleting banner' });
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setToast({ type: 'success', message: 'Banner status updated' });
        fetchBanners();
      } else {
        setToast({ type: 'error', message: 'Failed to update banner status' });
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      setToast({ type: 'error', message: 'Error updating banner' });
    }
  };

  const handleSaveBanner = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('width', data.width);
      formDataToSend.append('height', data.height);
      formDataToSend.append('priority', data.priority);
      formDataToSend.append('is_active', data.is_active);
      formDataToSend.append('link_url', data.link_url);
      
      if (data.image) {
        formDataToSend.append('image', data.image);
      }

      const url = editingBanner 
        ? `${API_BASE_URL}/api/admin/banners/${editingBanner.id}`
        : `${API_BASE_URL}/api/admin/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();
      if (result.success) {
        setToast({ type: 'success', message: editingBanner ? 'Banner updated successfully' : 'Banner created successfully' });
        setShowModal(false);
        fetchBanners();
      } else {
        setToast({ type: 'error', message: result.message || 'Failed to save banner' });
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      setToast({ type: 'error', message: 'Error saving banner' });
    }
  };

  return (
    <Layout>
      <div className="banners-container">
        <div className="banners-header">
          <div>
            <h1>Mobile Banners</h1>
            <p>Manage promotional banners for mobile app</p>
          </div>
          <button className="btn-primary" onClick={handleAddBanner}>
            <Plus size={20} />
            Add Banner
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="empty-state">
            <Upload size={48} />
            <h2>No banners yet</h2>
            <p>Create your first mobile banner</p>
            <button className="btn-primary" onClick={handleAddBanner}>
              <Plus size={20} />
              Create Banner
            </button>
          </div>
        ) : (
          <div className="banners-grid">
            {banners.map((banner) => (
              <div key={banner.id} className="banner-card">
                <div className="banner-image-container">
                  <img 
                    src={`${API_BASE_URL}${banner.image_url}`} 
                    alt={banner.title}
                    className="banner-image"
                  />
                  <div className="banner-overlay">
                    <span className="resolution-badge">
                      {banner.width}x{banner.height}
                    </span>
                  </div>
                </div>
                
                <div className="banner-content">
                  <h3>{banner.title}</h3>
                  <div className="banner-meta">
                    <span className="priority-badge">Priority: {banner.priority}</span>
                    <span className={`status-badge ${banner.is_active ? 'active' : 'inactive'}`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {banner.link_url && (
                    <p className="banner-link">Link: {banner.link_url}</p>
                  )}
                </div>

                <div className="banner-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleToggleActive(banner.id, banner.is_active)}
                    title={banner.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {banner.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEditBanner(banner)}
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteBanner(banner.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <BannerModal
            banner={editingBanner}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveBanner}
            onClose={() => setShowModal(false)}
          />
        )}

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Banners;
