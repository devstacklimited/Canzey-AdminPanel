import React from 'react';
import { Activity, TrendingUp, Users, DollarSign, ShoppingCart, Package, FileText, Star, Eye, Download, MoreVertical, TrendingDown, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Home.css';

const Home = () => {
  const recentOrders = [
    { id: '#1234', customer: 'John Doe', product: 'Laptop Pro', status: 'completed', amount: '$1,299', date: '2024-01-15' },
    { id: '#1235', customer: 'Jane Smith', product: 'Wireless Mouse', status: 'pending', amount: '$49', date: '2024-01-15' },
    { id: '#1236', customer: 'Bob Johnson', product: 'USB-C Hub', status: 'processing', amount: '$79', date: '2024-01-14' },
    { id: '#1237', customer: 'Alice Brown', product: 'Keyboard', status: 'completed', amount: '$159', date: '2024-01-14' },
  ];

  const recentInvoices = [
    { id: 'INV-001', customer: 'John Doe', amount: '$1,299', status: 'paid', date: '2024-01-15' },
    { id: 'INV-002', customer: 'Jane Smith', amount: '$49', status: 'pending', date: '2024-01-15' },
    { id: 'INV-003', customer: 'Bob Johnson', amount: '$79', status: 'paid', date: '2024-01-14' },
    { id: 'INV-004', customer: 'Alice Brown', amount: '$159', status: 'overdue', date: '2024-01-13' },
  ];

  const reviews = [
    { id: 1, customer: 'John Doe', product: 'Laptop Pro', rating: 5, comment: 'Excellent product! Fast delivery and great quality.', date: '2024-01-15', avatar: 'J' },
    { id: 2, customer: 'Jane Smith', product: 'Wireless Mouse', rating: 4, comment: 'Good mouse, comfortable to use for long hours.', date: '2024-01-14', avatar: 'J' },
    { id: 3, customer: 'Bob Johnson', product: 'USB-C Hub', rating: 5, comment: 'Perfect for my setup. All ports working great!', date: '2024-01-14', avatar: 'B' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'processing':
        return <Package size={16} />;
      case 'cancelled':
      case 'overdue':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'star-filled' : 'star-empty'}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <Layout>
      <div className="home-page">
        <div className="home-container">
          {/* Page Header */}
          <div className="home-header">
            <div className="home-header-content">
              <h1 className="home-title">Dashboard Overview</h1>
              <p className="home-subtitle">Welcome back! Here's what's happening with your store today.</p>
            </div>
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span>Live</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="home-stats-grid">
            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon violet">
                <DollarSign size={24} />
              </div>
              <div className="home-stat-content">
                <h3>$24,563</h3>
                <p className="home-stat-label">Total Revenue</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +12.5%
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon blue">
                <ShoppingCart size={24} />
              </div>
              <div className="home-stat-content">
                <h3>1,423</h3>
                <p className="home-stat-label">Total Orders</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +8.2%
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon pink">
                <Users size={24} />
              </div>
              <div className="home-stat-content">
                <h3>892</h3>
                <p className="home-stat-label">Customers</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +15.3%
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon orange">
                <Activity size={24} />
              </div>
              <div className="home-stat-content">
                <h3>89</h3>
                <p className="home-stat-label">Active Orders</p>
                <span className="home-stat-change negative">
                  <TrendingDown size={16} />
                  -3.1%
                </span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="home-content-grid">
            {/* Recent Orders */}
            <div className="home-section orders-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Package size={24} className="section-icon" />
                  Recent Orders
                </h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="orders-list">
                {recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-header-info">
                        <span className="order-id">{order.id}</span>
                        <span className={`order-status ${order.status}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="order-details">
                        <div className="order-customer">
                          <div className="customer-avatar-small">{order.customer.charAt(0)}</div>
                          <div>
                            <p className="customer-name-small">{order.customer}</p>
                            <p className="product-name-small">{order.product}</p>
                          </div>
                        </div>
                        <div className="order-meta">
                          <span className="order-amount">{order.amount}</span>
                          <span className="order-date-small">{order.date}</span>
                        </div>
                      </div>
                    </div>
                    <button className="order-action-btn">
                      <Eye size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="home-section activity-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Activity size={24} className="section-icon" />
                  Recent Activity
                </h2>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon sale">
                    <DollarSign size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">New sale completed</p>
                    <span className="activity-time">2 minutes ago</span>
                  </div>
                  <span className="activity-value">$1,299</span>
                </div>
                <div className="activity-item">
                  <div className="activity-icon user">
                    <Users size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">New user registered</p>
                    <span className="activity-time">5 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon order">
                    <Package size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">Order #1235 shipped</p>
                    <span className="activity-time">12 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon review">
                    <Star size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">New review received</p>
                    <span className="activity-time">25 minutes ago</span>
                  </div>
                  <div className="activity-stars">
                    {renderStars(5)}
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon invoice">
                    <FileText size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">Invoice generated</p>
                    <span className="activity-time">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout - Invoices and Reviews */}
          <div className="home-content-grid">
            {/* Recent Invoices */}
            <div className="home-section invoices-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FileText size={24} className="section-icon" />
                  Recent Invoices
                </h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="invoices-list">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="invoice-item">
                    <div className="invoice-info">
                      <div className="invoice-id-wrapper">
                        <FileText size={18} className="invoice-icon" />
                        <span className="invoice-id">{invoice.id}</span>
                      </div>
                      <div className="invoice-details">
                        <p className="invoice-customer">{invoice.customer}</p>
                        <p className="invoice-date">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="invoice-meta">
                      <span className="invoice-amount">{invoice.amount}</span>
                      <span className={`invoice-status ${invoice.status}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      <button className="invoice-action-btn">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="home-section reviews-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Star size={24} className="section-icon" />
                  Recent Reviews
                </h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">{review.avatar}</div>
                        <div>
                          <p className="reviewer-name">{review.customer}</p>
                          <p className="review-product">{review.product}</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <span className="review-date">{review.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;