import React from 'react';
import { Activity, TrendingUp, Users, DollarSign, ShoppingCart, Package, FileText, Star, Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Home.css';

const Home = () => {
  // No static data - all empty arrays
  const recentOrders = [];
  const recentInvoices = [];
  const reviews = [];

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

          {/* Stats Grid - All zeros */}
          <div className="home-stats-grid">
            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon violet">
                <DollarSign size={24} />
              </div>
              <div className="home-stat-content">
                <h3>$0</h3>
                <p className="home-stat-label">Total Revenue</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +0%
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon blue">
                <ShoppingCart size={24} />
              </div>
              <div className="home-stat-content">
                <h3>0</h3>
                <p className="home-stat-label">Total Orders</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +0%
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon pink">
                <Users size={24} />
              </div>
              <div className="home-stat-content">
                <h3>0</h3>
                <p className="home-stat-label">Customers</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +0%
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="stat-card-bg"></div>
              <div className="home-stat-icon orange">
                <Activity size={24} />
              </div>
              <div className="home-stat-content">
                <h3>0</h3>
                <p className="home-stat-label">Active Orders</p>
                <span className="home-stat-change positive">
                  <TrendingUp size={16} />
                  +0%
                </span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="home-content-grid">
            {/* Recent Orders - Empty */}
            <div className="home-section orders-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Package size={24} className="section-icon" />
                  Recent Orders
                </h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="orders-list">
                {recentOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No recent orders
                  </div>
                ) : (
                  recentOrders.map((order) => (
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
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity - Empty */}
            <div className="home-section activity-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Activity size={24} className="section-icon" />
                  Recent Activity
                </h2>
              </div>
              <div className="activity-list">
                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No recent activity
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout - Invoices and Reviews */}
          <div className="home-content-grid">
            {/* Recent Invoices - Empty */}
            <div className="home-section invoices-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FileText size={24} className="section-icon" />
                  Recent Invoices
                </h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="invoices-list">
                {recentInvoices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No recent invoices
                  </div>
                ) : (
                  recentInvoices.map((invoice) => (
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
                  ))
                )}
              </div>
            </div>

            {/* Recent Reviews - Empty */}
            <div className="home-section reviews-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Star size={24} className="section-icon" />
                  Recent Reviews
                </h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No recent reviews
                  </div>
                ) : (
                  reviews.map((review) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;