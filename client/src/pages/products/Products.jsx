import React, { useState, useEffect } from 'react';
import { Plus, Edit, Package, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import ProductModal from './components/ProductModal';
import Toast from '../../components/ui/Toast';
import '../../components/ui/ToggleSwitch.css';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sku: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    status: 'active',
    category: '',
    sub_category: '',
    for_gender: '',
    is_customized: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setToast({ type: 'error', message: 'Failed to fetch products' });
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
    const files = Array.from(e.target.files);
    
    // Limit to 10 images total
    const totalImages = existingImages.length + selectedImages.length + files.length;
    if (totalImages > 10) {
      setToast({ type: 'error', message: 'Maximum 10 images allowed' });
      return;
    }
    
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? `http://localhost:5000/api/admin/products/${editingProduct.id}`
        : 'http://localhost:5000/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('sku', formData.sku || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('sale_price', formData.sale_price || '');
      formDataToSend.append('stock_quantity', formData.stock_quantity || 0);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('category', formData.category || '');
      formDataToSend.append('sub_category', formData.sub_category || '');
      formDataToSend.append('for_gender', formData.for_gender || '');
      formDataToSend.append('is_customized', formData.is_customized ? '1' : '0');
      
      // Add existing images if editing
      if (editingProduct && existingImages.length > 0) {
        formDataToSend.append('existing_images', JSON.stringify(existingImages));
      }
      
      // Add new image files
      selectedImages.forEach(file => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          type: 'success',
          message: editingProduct ? 'Product updated successfully!' : 'Product created successfully!'
        });
        setShowModal(false);
        resetForm();
        fetchProducts();
      } else {
        setToast({
          type: 'error',
          message: data.error || data.message || 'Failed to save product'
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setToast({ type: 'error', message: 'Error saving product' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      sku: product.sku || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock_quantity: product.stock_quantity || 0,
      status: product.status || 'active',
      category: product.category || '',
      sub_category: product.sub_category || '',
      for_gender: product.for_gender || '',
      is_customized: product.is_customized === 1 || product.is_customized === true
    });
    
    // Set existing images
    const existingImageUrls = product.images?.map(img => img.image_url) || [];
    setExistingImages(existingImageUrls);
    
    // Clear new images
    setSelectedImages([]);
    setImagePreviews([]);
    
    setShowModal(true);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    // Optimistic update
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          type: 'success',
          message: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
        });
      } else {
        // Revert on failure
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, status: currentStatus } : p
        ));
        setToast({
          type: 'error',
          message: data.message || 'Failed to update status'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, status: currentStatus } : p
      ));
      setToast({
        type: 'error',
        message: 'Error updating status'
      });
    }
  };

  const handleDelete = async () => {
    if (!editingProduct) return;
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/products/${editingProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setToast({ type: 'success', message: 'Product deleted successfully!' });
        setShowModal(false);
        fetchProducts();
      } else {
        setToast({ type: 'error', message: data.message || 'Failed to delete product' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ type: 'error', message: 'Error deleting product' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      sku: '',
      price: '',
      sale_price: '',
      stock_quantity: '',
      status: 'active',
      category: '',
      sub_category: '',
      for_gender: '',
      is_customized: false
    });
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="products-container">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        <div className="products-header">
          <div className="products-header-left">
            <Package size={32} />
            <div>
              <h1>Products</h1>
              <p>Manage your product catalog</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Add Product
          </button>
        </div>

        <div className="products-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="products-table-container">
          {loading && products.length === 0 ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      {product.main_image_url ? (
                        <img src={`http://localhost:5000${product.main_image_url}`} alt={product.name} className="product-image" />
                      ) : (
                        <div className="product-image-placeholder">
                          <Package size={20} />
                        </div>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td>{product.sku || '-'}</td>
                    <td>
                      {product.sale_price ? (
                        <div className="price-display">
                          <span className="sale-price">${product.sale_price}</span>
                          <span className="original-price">${product.price}</span>
                        </div>
                      ) : (
                        <span>${product.price}</span>
                      )}
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-icon" onClick={() => handleEdit(product)}>
                        <Edit size={18} />
                      </button>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={product.status === 'active'}
                          onChange={() => handleStatusToggle(product.id, product.status)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Product Modal */}
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          formData={formData}
          onInputChange={handleInputChange}
          existingImages={existingImages}
          imagePreviews={imagePreviews}
          selectedImages={selectedImages}
          onImageChange={handleImageChange}
          onRemoveExistingImage={removeExistingImage}
          onRemoveNewImage={removeNewImage}
          loading={loading}
          isEditing={!!editingProduct}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
};

export default Products;
