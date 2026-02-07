import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Bell, Send, Users, Globe, CheckCircle, XCircle, AlertCircle, Loader, Search } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import './Notifications.css';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('topic');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAllCustomers = () => {
    const customersWithTokens = getFilteredCustomers().filter(c => c.fcm_token);
    if (selectedCustomers.length === customersWithTokens.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersWithTokens.map(c => c.id));
    }
  };

  const getFilteredCustomers = () => {
    if (!searchTerm) return customers;
    
    const lower = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.first_name?.toLowerCase().includes(lower) ||
      customer.last_name?.toLowerCase().includes(lower) ||
      customer.email?.toLowerCase().includes(lower) ||
      customer.phone_number?.includes(searchTerm)
    );
  };

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    data: '',
    image: '',
    topic: 'canzey-topic'
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATIONS_CUSTOMERS, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendNotification = async (type) => {
    setLoading(true);
    setResult(null);

    try {
      let url, body;

      switch (type) {
        case 'topic':
          url = API_ENDPOINTS.ADMIN.NOTIFICATIONS_TOPIC;
          body = {
            topic: formData.topic,
            title: formData.title,
            body: formData.body,
            data: formData.data ? JSON.parse(formData.data) : undefined,
            image: formData.image || undefined
          };
          break;

        case 'customers':
          if (selectedCustomers.length === 0) {
            setResult({
              success: false,
              message: 'Please select at least one customer'
            });
            setLoading(false);
            return;
          }
          
          url = API_ENDPOINTS.ADMIN.NOTIFICATIONS_CUSTOMER;
          body = {
            customerIds: selectedCustomers,
            title: formData.title,
            body: formData.body,
            data: formData.data ? JSON.parse(formData.data) : undefined,
            image: formData.image || undefined
          };
          break;

        default:
          return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          details: data.result
        });
        // Reset form
        setFormData({
          title: '',
          body: '',
          data: '',
          image: '',
          topic: 'canzey-topic'
        });
        setSelectedCustomers([]);
      } else {
        setResult({
          success: false,
          message: data.message,
          error: data.error
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setResult({
        success: false,
        message: 'Failed to send notification',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATIONS_TEST, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: activeTab === 'topic' ? 'topic' : 'customer',
          target: activeTab === 'topic' ? formData.topic : (selectedCustomers[0] || null),
          title: 'Test Notification',
          body: 'This is a test notification from Canzey Admin Panel'
        })
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message,
        details: data.result
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      setResult({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <h1>Notifications Sender</h1>
            <p>Send push notifications to customers</p>
          </div>
        </div>

        <div className="notifications-tabs">
          <button
            className={`tab-btn ${activeTab === 'topic' ? 'active' : ''}`}
            onClick={() => setActiveTab('topic')}
          >
            <Globe size={18} />
            Topic Notification
          </button>
          <button
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={18} />
            Multiple Customers
          </button>
        </div>

        <div className="notifications-content">
          <div className="notification-form">
            <div className="form-section">
              <h3>
                {activeTab === 'topic' && 'Topic Notification'}
                {activeTab === 'customers' && 'Multiple Customers Notification'}
              </h3>

              {activeTab === 'topic' && (
                <div className="form-group">
                  <label>Topic Name</label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="canzey-topic"
                  />
                  <small>Default topic for all app users</small>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="form-group">
                  <label>Search & Select Customers</label>
                  <div className="search-dropdown-container">
                    <div className="search-input-wrapper">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    
                    {searchTerm && getFilteredCustomers().length > 0 && (
                      <div className="dropdown-results">
                        {getFilteredCustomers().map(customer => (
                          <div 
                            key={customer.id} 
                            className={`dropdown-item ${!customer.fcm_token ? 'disabled' : 'clickable'} ${selectedCustomers.includes(customer.id) ? 'selected' : ''}`}
                            onClick={() => customer.fcm_token && handleCustomerSelect(customer.id)}
                          >
                            <div className="tile-content">
                              <div className="tile-header">
                                <span className="customer-name">
                                  {customer.first_name} {customer.last_name}
                                </span>
                                <span className={`fcm-badge ${customer.fcm_token ? 'has-token' : 'no-token'}`}>
                                  {customer.fcm_token ? '✓ FCM' : '✗ No FCM'}
                                </span>
                              </div>
                              <div className="tile-details">
                                <div className="detail-item">
                                  <span className="detail-label">Email:</span>
                                  <span className="detail-value">{customer.email}</span>
                                </div>
                                {customer.phone_number && (
                                  <div className="detail-item">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{customer.phone_number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {selectedCustomers.includes(customer.id) && (
                              <div className="tile-checkmark">✓</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {searchTerm && getFilteredCustomers().length === 0 && (
                      <div className="dropdown-empty">
                        No customers found
                      </div>
                    )}
                  </div>

                  {selectedCustomers.length > 0 && (
                    <div className="receivers-section">
                      <div className="receivers-header">
                        <h4>📬 Recipients ({selectedCustomers.length})</h4>
                        <button
                          type="button"
                          className="btn-clear-all"
                          onClick={() => setSelectedCustomers([])}
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="receivers-list">
                        {selectedCustomers.map(customerId => {
                          const customer = customers.find(c => c.id === customerId);
                          return customer ? (
                            <div key={customerId} className="receiver-card">
                              <div className="receiver-info">
                                <div className="receiver-name">
                                  {customer.first_name} {customer.last_name}
                                </div>
                                <div className="receiver-details">
                                  <span className="receiver-email">{customer.email}</span>
                                  {customer.phone_number && (
                                    <span className="receiver-phone">{customer.phone_number}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-remove-receiver"
                                onClick={() => handleCustomerSelect(customerId)}
                                title="Remove from recipients"
                              >
                                ✕
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  placeholder="Enter notification message"
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Custom Data (JSON, Optional)</label>
                <textarea
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  placeholder='{"key": "value", "type": "promotion"}'
                  rows={3}
                />
                <small>JSON format for additional data</small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTestNotification}
                  disabled={loading || (activeTab === 'customers' && selectedCustomers.length === 0)}
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : <AlertCircle size={16} />}
                  Test Send
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSendNotification(activeTab)}
                  disabled={loading || !formData.title || !formData.body || (activeTab === 'customers' && selectedCustomers.length === 0)}
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? 'Sending...' : `Send to ${selectedCustomers.length} Customer${selectedCustomers.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className={`result-box ${result.success ? 'success' : 'error'}`}>
              <div className="result-header">
                {result.success ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
                <h4>{result.success ? 'Success' : 'Error'}</h4>
              </div>
              <p>{result.message}</p>
              {result.details && (
                <div className="result-details">
                  <pre>{JSON.stringify(result.details, null, 2)}</pre>
                </div>
              )}
              {result.error && (
                <div className="result-error">
                  <small>Error: {result.error}</small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
