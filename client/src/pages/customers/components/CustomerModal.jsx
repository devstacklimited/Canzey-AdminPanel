import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Lock, CheckCircle, XCircle } from 'lucide-react';
import { API_ENDPOINTS, getJsonHeaders } from '../../../config/api';
import '../../../components/ui/ToggleSwitch.css';
import './CustomerModal.css';

const CustomerModal = ({ customer, onClose, onUpdate, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '', // Only for create
    profile_url: '',
    status: 'active'
  });

  const isCreateMode = !customer;

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        password: '', 
        profile_url: customer.profile_url || '',
        status: customer.status || 'active'
      });
    } else {
      // Reset for create mode
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        profile_url: '',
        status: 'active'
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview for both modes
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    if (isCreateMode) {
      // Store file for upload after customer creation
      setAvatarFile(file);
      return;
    }

    // Edit mode: upload immediately
    if (!customer) return;

    try {
      setUploadingAvatar(true);
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await fetch(API_ENDPOINTS.ADMIN.CUSTOMER_AVATAR(customer.id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success && data.customer) {
        setFormData(prev => ({ ...prev, profile_url: data.customer.profile_url || '' }));
        onUpdate && onUpdate(data.customer);
      } else {
        alert(data.message || 'Failed to upload avatar');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Upload avatar for newly created customer
  const uploadAvatarForCustomer = async (customerId) => {
    if (!avatarFile) return;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', avatarFile);

      const response = await fetch(API_ENDPOINTS.ADMIN.CUSTOMER_AVATAR(customerId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();
      return data.success ? data.customer : null;
    } catch (err) {
      console.error('Error uploading avatar for new customer:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url, method, body;

      if (isCreateMode) {
        url = API_ENDPOINTS.ADMIN.ADD_CUSTOMER;
        method = 'POST';
        body = JSON.stringify(formData);
      } else {
        url = API_ENDPOINTS.ADMIN.UPDATE_CUSTOMER(customer.id);
        method = 'PUT';
        // Don't send password on update for now
        const { password, ...updateData } = formData;
        body = JSON.stringify(updateData);
      }

      const response = await fetch(url, {
        method,
        headers: getJsonHeaders(),
        body
      });

      const data = await response.json();

      if (data.success) {
        let finalCustomer = data.customer;
        
        if (isCreateMode && avatarFile) {
          // Upload avatar for newly created customer
          const updatedCustomer = await uploadAvatarForCustomer(data.customer.id);
          if (updatedCustomer) {
            finalCustomer = updatedCustomer;
          }
        }
        
        if (isCreateMode) {
          onCreate(finalCustomer);
        } else {
          onUpdate(finalCustomer);
        }
        onClose();
      } else {
        alert(data.message || 'Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (isCreateMode) {
        setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }));
        return;
    }

    const newStatus = formData.status === 'active' ? 'inactive' : 'active';
    // Optimistic update
    setFormData(prev => ({ ...prev, status: newStatus }));

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.UPDATE_CUSTOMER_STATUS(customer.id), {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!data.success) {
        // Revert on failure
        setFormData(prev => ({ ...prev, status: formData.status }));
        alert(data.message || 'Failed to update status');
      } else {
        // Notify parent of update
        onUpdate({ ...customer, ...formData, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setFormData(prev => ({ ...prev, status: formData.status }));
      alert('Error updating status');
    }
  };

  // Render logic changes for create mode
  // if (!customer && !isCreateMode) return null; // handled by parent

  return (
    <div className="modal-overlay">
      <div className="modal-content customer-modal">
        <div className="modal-header">
          <h2>{isCreateMode ? 'Add New Customer' : 'Customer Details'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {!isCreateMode && (
            <div className="customer-profile-header">
              <div className="customer-avatar-large">
                {customer.profile_url ? (
                  <img src={customer.profile_url} alt={customer.first_name} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </div>
                )}
              </div>
              <div className="customer-info-header">
                <h3>{customer.first_name} {customer.last_name}</h3>
                <p className="customer-email">{customer.email}</p>
                <div className="customer-status-toggle">
                  <span className={`status-badge status-${formData.status}`}>
                    {formData.status}
                  </span>
                  <button 
                    type="button" 
                    className={`btn-toggle ${formData.status === 'active' ? 'active' : ''}`}
                    onClick={toggleStatus}
                  >
                    {formData.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isCreateMode}
                  className={!isCreateMode ? "disabled-input" : ""}
                  required
                />
              </div>
              {!isCreateMode && <small className="form-hint">Email cannot be changed</small>}
            </div>

            {isCreateMode && (
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 characters"
                    minLength={6}
                  />
                </div>
                <small className="form-hint">Required for Firebase login</small>
              </div>
            )}

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder={isCreateMode ? "+1234567890" : "Not provided"}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Profile Image</label>
              <div className="avatar-upload-container">
                <div className="avatar-preview-wrapper">
                  {(avatarPreview || formData.profile_url) ? (
                    <img 
                      src={avatarPreview || (formData.profile_url.startsWith('http') ? formData.profile_url : `${window.location.origin}${formData.profile_url}`)} 
                      alt="Profile preview" 
                      className="avatar-preview-img"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <div className="avatar-upload-actions">
                  <label className="avatar-upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={uploadingAvatar}
                      style={{ display: 'none' }}
                    />
                    {uploadingAvatar ? 'Uploading...' : (avatarPreview || formData.profile_url ? 'Change Image' : 'Choose Image')}
                  </label>
                  {(avatarPreview || formData.profile_url) && !uploadingAvatar && (
                    <button 
                      type="button" 
                      className="avatar-remove-btn"
                      onClick={() => {
                        setAvatarPreview(null);
                        setAvatarFile(null);
                        if (!isCreateMode) {
                          setFormData(prev => ({ ...prev, profile_url: '' }));
                        }
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isCreateMode && (
               <div className="form-group">
                <label>Status</label>
                <div className="customer-status-toggle" style={{ justifyContent: 'flex-start', marginTop: '8px' }}>
                  <span className={`status-badge status-${formData.status}`}>
                    {formData.status}
                  </span>
                  <button 
                    type="button" 
                    className={`btn-toggle ${formData.status === 'active' ? 'active' : ''}`}
                    onClick={toggleStatus}
                  >
                    {formData.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (isCreateMode ? 'Create Customer' : 'Save Changes')}
                <Save size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
