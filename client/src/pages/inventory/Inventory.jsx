import React, { useState } from 'react';
import { Search, Plus, Package, Edit, Trash2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Inventory.css';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    { id: 1, name: 'Laptop Pro X1', sku: 'LPX-001', category: 'Electronics', stock: 45, price: '$1,299', status: 'in-stock', trend: 'up' },
    { id: 2, name: 'Wireless Mouse', sku: 'WM-002', category: 'Accessories', stock: 120, price: '$49', status: 'in-stock', trend: 'stable' },
    { id: 3, name: 'USB-C Hub', sku: 'UCH-003', category: 'Accessories', stock: 8, price: '$79', status: 'low-stock', trend: 'down' },
    { id: 4, name: 'Mechanical Keyboard', sku: 'MK-004', category: 'Electronics', stock: 0, price: '$159', status: 'out-of-stock', trend: 'down' },
    { id: 5, name: 'Monitor Stand', sku: 'MS-005', category: 'Furniture', stock: 67, price: '$89', status: 'in-stock', trend: 'up' },
    { id: 6, name: 'Webcam HD', sku: 'WC-006', category: 'Electronics', stock: 15, price: '$129', status: 'in-stock', trend: 'stable' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-stock': return 'inventory-status-badge inventory-status-in-stock';
      case 'low-stock': return 'inventory-status-badge inventory-status-low-stock';
      case 'out-of-stock': return 'inventory-status-badge inventory-status-out-of-stock';
      default: return 'inventory-status-badge';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="inventory-trend-up" />;
      case 'down': return <TrendingDown size={16} className="inventory-trend-down" />;
      case 'stable': return <Minus size={16} className="inventory-trend-stable" />;
      default: return <Minus size={16} />;
    }
  };

  return (
    <Layout>
      <div className="inventory-container">
        {/* Page Header */}
        <div className="inventory-header">
          <h1 className="inventory-title">Inventory Management</h1>
          <p className="inventory-subtitle">Track and manage your product inventory</p>
        </div>

        {/* Search and Actions */}
        <div className="inventory-controls">
          <div className="inventory-search">
            <Search className="inventory-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inventory-search-input"
            />
          </div>
          
          <button className="inventory-add-btn">
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Summary Cards */}
        <div className="inventory-summary">
          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-total">
              <Package size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">6</h3>
              <p className="inventory-summary-label">Total Products</p>
            </div>
          </div>

          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-in-stock">
              <Package size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">4</h3>
              <p className="inventory-summary-label">In Stock</p>
            </div>
          </div>

          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-low-stock">
              <AlertCircle size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">1</h3>
              <p className="inventory-summary-label">Low Stock</p>
            </div>
          </div>

          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-out-stock">
              <AlertCircle size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">1</h3>
              <p className="inventory-summary-label">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Trend</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="inventory-table-row">
                  <td className="inventory-product-name">
                    <div className="inventory-product-info">
                      <div className="inventory-product-avatar">
                        <Package size={20} />
                      </div>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="inventory-sku">{product.sku}</td>
                  <td className="inventory-category">{product.category}</td>
                  <td className="inventory-stock">
                    <span className={`inventory-stock-value ${
                      product.stock === 0 ? 'stock-zero' : 
                      product.stock <= 10 ? 'stock-low' : 'stock-normal'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="inventory-price">{product.price}</td>
                  <td>
                    <span className={getStatusBadge(product.status)}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="inventory-trend">
                    {getTrendIcon(product.trend)}
                  </td>
                  <td className="inventory-actions">
                    <div className="inventory-action-buttons">
                      <button className="inventory-action-btn inventory-edit-btn" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="inventory-action-btn inventory-delete-btn" title="Delete">
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

export default Inventory;
