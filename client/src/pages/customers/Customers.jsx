import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { CheckCircle, XCircle } from 'lucide-react';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      applyFilters(list, searchTerm, statusFilter);
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
        c.email?.toLowerCase().includes(lower) ||
        c.id?.toString().includes(lower)
      );
    }

    setFiltered(result);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters(customers, searchTerm, statusFilter);
  }, [customers, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'suspended':
        return 'status-suspended';
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="customers-container">
        <div className="customers-header">
          <h1>Canzey Customers</h1>
          <p>View and manage all customer accounts</p>
        </div>

        <div className="customers-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
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
            <div className="loading">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="no-customers">No customers found</div>
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="customer-id">#{c.id}</td>
                    <td className="customer-name">{c.first_name} {c.last_name}</td>
                    <td className="customer-email">{c.email}</td>
                    <td className="customer-phone">{c.phone_number || 'N/A'}</td>
                    <td>
                      <span className={`badge ${getStatusColor(c.status)}`}>
                        {c.status === 'active' && <CheckCircle size={14} />}
                        {c.status === 'inactive' && <XCircle size={14} />}
                        {c.status === 'suspended' && <XCircle size={14} />}
                        {c.status}
                      </span>
                    </td>
                    <td className="customer-joined">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
