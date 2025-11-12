import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Edit, Trash2, AlertCircle, TrendingUp, TrendingDown, Minus, Eye, ShoppingCart } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import AddInventoryModal from './components/AddInventoryModal';
import EditInventoryModal from './components/EditInventoryModal';
import StockUpdateModal from './components/StockUpdateModal';
import './Inventory.css';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stats, setStats] = useState({
    total_items: 0,
    active_items: 0,
    low_stock_items: 0,
    total_inventory_value: 0
  });

  // Fetch inventory data
  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchStats();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`http://localhost:5000/api/inventory?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setInventory(result.data || []);
      } else {
        console.error('Failed to fetch inventory');
        setInventory([]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdateStock = (item) => {
    setSelectedItem(item);
    setShowStockModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchInventory();
          fetchStats();
        } else {
          alert('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const onModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowStockModal(false);
    setSelectedItem(null);
    fetchInventory();
    fetchStats();
  };

  const getStatusBadge = (item) => {
    if (item.available_quantity === 0) {
      return 'inventory-status-badge inventory-status-out-of-stock';
    } else if (item.available_quantity <= item.minimum_stock_level) {
      return 'inventory-status-badge inventory-status-low-stock';
    } else {
      return 'inventory-status-badge inventory-status-in-stock';
    }
  };

  const getStatusText = (item) => {
    if (item.available_quantity === 0) {
      return 'Out of Stock';
    } else if (item.available_quantity <= item.minimum_stock_level) {
      return 'Low Stock';
    } else {
      return 'In Stock';
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
          <div className="inventory-filters">
            <div className="inventory-search">
              <Search className="inventory-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search t-shirts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="inventory-search-input"
              />
            </div>
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="inventory-filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="inventory-filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          
          <button className="inventory-add-btn" onClick={handleAddItem}>
            <Plus size={20} />
            Add T-Shirt
          </button>
        </div>

        {/* Summary Cards */}
        <div className="inventory-summary">
          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-total">
              <Package size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">{stats.total_items}</h3>
              <p className="inventory-summary-label">Total Items</p>
            </div>
          </div>

          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-in-stock">
              <ShoppingCart size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">{stats.active_items}</h3>
              <p className="inventory-summary-label">Active Items</p>
            </div>
          </div>

          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-low-stock">
              <AlertCircle size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">{stats.low_stock_items}</h3>
              <p className="inventory-summary-label">Low Stock</p>
            </div>
          </div>

          <div className="inventory-summary-card">
            <div className="inventory-summary-icon inventory-summary-value">
              <TrendingUp size={24} />
            </div>
            <div className="inventory-summary-content">
              <h3 className="inventory-summary-value">${stats.total_inventory_value.toFixed(2)}</h3>
              <p className="inventory-summary-label">Total Value</p>
            </div>
          </div>
        </div>

        {/* T-Shirts Grid View */}
        <div className="inventory-grid-container">
          {loading ? (
            <div className="inventory-loading">
              <div className="loading-spinner"></div>
              <p>Loading your t-shirt inventory...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="inventory-no-data">
              <div className="empty-state-icon">👕</div>
              <h3>No T-Shirts in Inventory</h3>
              <p>Start by adding your first t-shirt to begin managing your inventory</p>
              <button onClick={handleAddItem} className="inventory-add-first-btn">
                <Plus size={20} />
                Add Your First T-Shirt
              </button>
            </div>
          ) : (
            <div className="inventory-grid">
              {inventory.map((item) => (
                <div key={item.id} className="inventory-card">
                  <div className="inventory-card-header">
                    <div className="inventory-card-avatar">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.name} />
                      ) : (
                        <div className="avatar-placeholder">👕</div>
                      )}
                    </div>
                    <div className="inventory-card-info">
                      <h3 className="inventory-card-title">{item.name}</h3>
                      {item.style && <span className="inventory-card-style">{item.style}</span>}
                      <p className="inventory-card-sku">SKU: {item.sku}</p>
                    </div>
                    <div className="inventory-card-status">
                      <span className={getStatusBadge(item)}>
                        {getStatusText(item)}
                      </span>
                    </div>
                  </div>

                  <div className="inventory-card-body">
                    <div className="inventory-details">
                      {item.brand && (
                        <div className="detail-item">
                          <span className="detail-label">Brand:</span>
                          <span className="detail-value">{item.brand}</span>
                        </div>
                      )}
                      {item.category && (
                        <div className="detail-item">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{item.category}</span>
                        </div>
                      )}
                      {item.material && (
                        <div className="detail-item">
                          <span className="detail-label">Material:</span>
                          <span className="detail-value">{item.material}</span>
                        </div>
                      )}
                      {item.fit_type && (
                        <div className="detail-item">
                          <span className="detail-label">Fit:</span>
                          <span className="detail-value capitalize">{item.fit_type}</span>
                        </div>
                      )}
                    </div>

                    <div className="inventory-metrics">
                      <div className="metric-item">
                        <div className="metric-label">Stock</div>
                        <div className={`metric-value stock-badge ${
                          item.available_quantity === 0 ? 'stock-zero' : 
                          item.available_quantity <= item.minimum_stock_level ? 'stock-low' : 'stock-normal'
                        }`}>
                          {item.available_quantity}
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-label">Price</div>
                        <div className="metric-value price-value">${item.selling_price}</div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-label">Min Stock</div>
                        <div className="metric-value">{item.minimum_stock_level}</div>
                      </div>
                    </div>
                  </div>

                  <div className="inventory-card-footer">
                    <button 
                      className="card-action-btn stock-btn"
                      onClick={() => handleUpdateStock(item)}
                      title="Update Stock"
                    >
                      <Package size={16} />
                      Stock
                    </button>
                    <button 
                      className="card-action-btn edit-btn"
                      onClick={() => handleEditItem(item)}
                      title="Edit T-Shirt"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="card-action-btn delete-btn"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete T-Shirt"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddInventoryModal
            onClose={onModalClose}
            categories={categories}
          />
        )}

        {showEditModal && selectedItem && (
          <EditInventoryModal
            item={selectedItem}
            onClose={onModalClose}
            categories={categories}
          />
        )}

        {showStockModal && selectedItem && (
          <StockUpdateModal
            item={selectedItem}
            onClose={onModalClose}
          />
        )}
      </div>
    </Layout>
  );
};

export default Inventory;
