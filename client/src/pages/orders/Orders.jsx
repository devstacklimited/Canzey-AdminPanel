import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Orders.css';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const orders = [
    { id: '#1234', customer: 'John Doe', product: 'Laptop Pro', status: 'completed', date: '2024-01-15', amount: '$1,299' },
    { id: '#1235', customer: 'Jane Smith', product: 'Wireless Mouse', status: 'pending', date: '2024-01-15', amount: '$49' },
    { id: '#1236', customer: 'Bob Johnson', product: 'USB-C Hub', status: 'processing', date: '2024-01-14', amount: '$79' },
    { id: '#1237', customer: 'Alice Brown', product: 'Mechanical Keyboard', status: 'completed', date: '2024-01-14', amount: '$159' },
    { id: '#1238', customer: 'Charlie Wilson', product: 'Monitor Stand', status: 'cancelled', date: '2024-01-13', amount: '$89' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="status-icon-completed" />;
      case 'pending': return <Clock size={20} className="status-icon-pending" />;
      case 'processing': return <Package size={20} className="status-icon-processing" />;
      case 'cancelled': return <XCircle size={20} className="status-icon-cancelled" />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'orders-status-badge orders-status-completed';
      case 'pending': return 'orders-status-badge orders-status-pending';
      case 'processing': return 'orders-status-badge orders-status-processing';
      case 'cancelled': return 'orders-status-badge orders-status-cancelled';
      default: return 'orders-status-badge';
    }
  };

  return (
    <Layout>
      <div className="orders-container">
        {/* Page Header */}
        <div className="orders-header">
          <h1 className="orders-title">Orders Management</h1>
          <p className="orders-subtitle">Manage and track all customer orders</p>
        </div>

        {/* Search and Filter */}
        <div className="orders-controls">
          <div className="orders-search">
            <Search className="orders-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
          </div>
          
          <div className="orders-filter">
            <Filter size={20} className="orders-filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="orders-filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="orders-add-btn">
            <Plus size={20} />
            Add Order
          </button>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="orders-table-row">
                  <td className="orders-order-id">{order.id}</td>
                  <td className="orders-customer">{order.customer}</td>
                  <td className="orders-product">{order.product}</td>
                  <td>
                    <div className="orders-status-cell">
                      {getStatusIcon(order.status)}
                      <span className={getStatusBadge(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="orders-date">{order.date}</td>
                  <td className="orders-amount">{order.amount}</td>
                  <td className="orders-actions">
                    <div className="orders-action-buttons">
                      <button className="orders-action-btn orders-view-btn" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="orders-action-btn orders-edit-btn" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="orders-action-btn orders-delete-btn" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
