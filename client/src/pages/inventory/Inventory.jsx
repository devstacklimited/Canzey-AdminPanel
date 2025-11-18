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
      
      // Mock inventory data - bypass server
      const mockInventory = [
        {
          id: 1,
          name: 'Classic Cotton T-Shirt',
          sku: 'TSH-001',
          brand: 'Canzey',
          category: 'T-Shirts',
          material: '100% Cotton',
          fit_type: 'regular',
          style: 'Crew Neck',
          selling_price: 25.99,
          cost_price: 12.50,
          total_quantity: 100,
          available_quantity: 85,
          minimum_stock_level: 10,
          status: 'active',
          is_featured: true,
          is_visible: true,
          thumbnail_url: '',
          images: [],
          tags: ['cotton', 'basic', 'unisex'],
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Premium V-Neck Tee',
          sku: 'TSH-002',
          brand: 'Canzey',
          category: 'Men T-Shirts',
          material: 'Cotton Blend',
          fit_type: 'slim',
          style: 'V-Neck',
          selling_price: 32.99,
          cost_price: 16.00,
          total_quantity: 75,
          available_quantity: 45,
          minimum_stock_level: 15,
          status: 'active',
          is_featured: false,
          is_visible: true,
          thumbnail_url: '',
          images: [],
          tags: ['premium', 'v-neck', 'men'],
          created_at: '2024-01-20T14:15:00Z'
        },
        {
          id: 3,
          name: 'Oversized Graphic Tee',
          sku: 'TSH-003',
          brand: 'Canzey',
          category: 'Women T-Shirts',
          material: '95% Cotton, 5% Spandex',
          fit_type: 'oversized',
          style: 'Graphic',
          selling_price: 28.99,
          cost_price: 14.50,
          total_quantity: 60,
          available_quantity: 8,
          minimum_stock_level: 10,
          status: 'active',
          is_featured: true,
          is_visible: true,
          thumbnail_url: '',
          images: [],
          tags: ['graphic', 'oversized', 'women'],
          created_at: '2024-01-25T09:45:00Z'
        }
      ];
      
      // Filter mock data based on search/filters
      let filteredData = mockInventory;
      
      if (searchTerm) {
        filteredData = filteredData.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory) {
        filteredData = filteredData.filter(item => item.category === selectedCategory);
      }
      
      if (selectedStatus) {
        filteredData = filteredData.filter(item => item.status === selectedStatus);
      }
      
      setInventory(filteredData);
    } catch (error) {
      console.error('Error loading mock inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Mock categories data - bypass server
      const mockCategories = [
        { id: 1, name: 'T-Shirts' },
        { id: 2, name: 'Men T-Shirts' },
        { id: 3, name: 'Women T-Shirts' },
        { id: 4, name: 'Kids T-Shirts' },
        { id: 5, name: 'Promotional' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading mock categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats data - bypass server
      const mockStats = {
        total_items: 3,
        active_items: 3,
        low_stock_items: 1,
        total_inventory_value: 2586.85
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading mock stats:', error);
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
              {inventory.map((item) => {
                // Debug: log image data
                console.log('Item:', item.name, 'Thumbnail:', item.thumbnail_url ? item.thumbnail_url.substring(0, 50) + '...' : 'none');
                return (
                <div key={item.id} className="inventory-tile">
                  <div className="inventory-tile-content">
                    <div className="inventory-tile-avatar">
                      {item.thumbnail_url && item.thumbnail_url.startsWith('data:') ? (
                        <img src={item.thumbnail_url} alt={item.name} />
                      ) : item.thumbnail_url && item.thumbnail_url.startsWith('http') ? (
                        <img src={item.thumbnail_url} alt={item.name} />
                      ) : (
                        // Test with a simple colored placeholder
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          fontWeight: 'bold'
                        }}>
                          👕
                        </div>
                      )}
                    </div>
                    
                    <div className="inventory-tile-info">
                      <div className="inventory-tile-main">
                        <div className="inventory-tile-title">
                          {item.name}
                          {item.style && <span className="inventory-tile-style">{item.style}</span>}
                        </div>
                        <p className="inventory-tile-sku">SKU: {item.sku}</p>
                      </div>
                      
                      <div className="inventory-tile-details">
                        <div className="tile-detail-item">
                          <div className="tile-detail-label">Stock</div>
                          <div className={`tile-detail-value stock-badge ${
                            item.available_quantity === 0 ? 'stock-zero' : 
                            item.available_quantity <= item.minimum_stock_level ? 'stock-low' : 'stock-normal'
                          }`}>
                            {item.available_quantity}
                          </div>
                        </div>
                        <div className="tile-detail-item">
                          <div className="tile-detail-label">Price</div>
                          <div className="tile-detail-value price-value">${item.selling_price}</div>
                        </div>
                        {item.brand && (
                          <div className="tile-detail-item">
                            <div className="tile-detail-label">Brand</div>
                            <div className="tile-detail-value">{item.brand}</div>
                          </div>
                        )}
                        {item.category && (
                          <div className="tile-detail-item">
                            <div className="tile-detail-label">Category</div>
                            <div className="tile-detail-value">{item.category}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="inventory-tile-status">
                        <span className={getStatusBadge(item)}>
                          {getStatusText(item)}
                        </span>
                      </div>
                      
                      <div className="inventory-tile-actions">
                        <button 
                          className="tile-action-btn tile-stock-btn"
                          onClick={() => handleUpdateStock(item)}
                          title="Update Stock"
                        >
                          <Package size={14} />
                        </button>
                        <button 
                          className="tile-action-btn tile-edit-btn"
                          onClick={() => handleEditItem(item)}
                          title="Edit T-Shirt"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="tile-action-btn tile-delete-btn"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete T-Shirt"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
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
