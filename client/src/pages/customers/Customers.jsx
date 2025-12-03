import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { CheckCircle, XCircle, Search, Filter, Eye, Plus } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import CustomerModal from './components/CustomerModal';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters(customers, searchTerm, statusFilter);
  }, [customers, searchTerm, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.CUSTOMERS, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        console.error('Failed to fetch customers');
        setCustomers([]);
        setFiltered([]);
        return;
      }

      const data = await res.json();
      const list = data.customers || [];
      setCustomers(list);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (list, search, status) => {
    let result = list;

    if (status !== 'all') {
      result = result.filter(c => c.status === status);
    }

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(c =>
        c.first_name?.toLowerCase().includes(lower) ||
        c.last_name?.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null); // Null means create mode
    setShowModal(true);
  };

  const handleCreateCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  return (
    <Layout>
      <div className="customers-container">
        <div className="customers-header">
          <div className="header-title">
            <h1>Canzey Customers</h1>
            <p>Manage your customer base</p>
          </div>
          <button className="btn-primary" onClick={handleAddCustomer}>
            <Plus size={16} />
            Add Customer
          </button>
        </div>

        <div className="customers-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={20} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="customers-table-container">
          {loading ? (
            <div className="loading-state">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No customers found</div>
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.profile_url ? (
                            <img src={customer.profile_url} alt={customer.first_name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {customer.first_name?.[0]}{customer.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <span className="customer-name">
                          {customer.first_name} {customer.last_name}
                        </span>
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone_number || '-'}</td>
                    <td>
                      <span className={`c-status-badge c-status-${customer.status}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="c-btn-details" 
                        onClick={() => handleViewDetails(customer)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateCustomer}
          onCreate={handleCreateCustomer}
        />
      )}
    </Layout>
  );
};

export default Customers;
