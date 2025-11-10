import React from 'react';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Home.css';

const Home = () => {
  return (
    <Layout>
      <div className="home-container">
        {/* Page Header */}
        <div className="home-header">
          <h1 className="home-title">Dashboard Overview</h1>
          <p className="home-subtitle">Welcome to your admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="home-stats-grid">
          <div className="home-stat-card">
            <div className="home-stat-icon home-stat-icon-blue">
              <TrendingUp size={24} />
            </div>
            <div className="home-stat-content">
              <h3 className="home-stat-value">$24,563</h3>
              <p className="home-stat-label">Total Revenue</p>
              <span className="home-stat-change positive">+12.5%</span>
            </div>
          </div>

          <div className="home-stat-card">
            <div className="home-stat-icon home-stat-icon-green">
              <Users size={24} />
            </div>
            <div className="home-stat-content">
              <h3 className="home-stat-value">1,423</h3>
              <p className="home-stat-label">Total Users</p>
              <span className="home-stat-change positive">+8.2%</span>
            </div>
          </div>

          <div className="home-stat-card">
            <div className="home-stat-icon home-stat-icon-purple">
              <Activity size={24} />
            </div>
            <div className="home-stat-content">
              <h3 className="home-stat-value">89</h3>
              <p className="home-stat-label">Active Orders</p>
              <span className="home-stat-change negative">-3.1%</span>
            </div>
          </div>

          <div className="home-stat-card">
            <div className="home-stat-icon home-stat-icon-orange">
              <DollarSign size={24} />
            </div>
            <div className="home-stat-content">
              <h3 className="home-stat-value">$3,421</h3>
              <p className="home-stat-label">Today's Sales</p>
              <span className="home-stat-change positive">+18.7%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="home-activity-section">
          <h2 className="home-section-title">Recent Activity</h2>
          <div className="home-activity-list">
            <div className="home-activity-item">
              <div className="home-activity-icon">
                <Users size={20} />
              </div>
              <div className="home-activity-content">
                <p className="home-activity-text">New user registered</p>
                <span className="home-activity-time">2 minutes ago</span>
              </div>
            </div>
            <div className="home-activity-item">
              <div className="home-activity-icon">
                <Activity size={20} />
              </div>
              <div className="home-activity-content">
                <p className="home-activity-text">Order #1234 completed</p>
                <span className="home-activity-time">5 minutes ago</span>
              </div>
            </div>
            <div className="home-activity-item">
              <div className="home-activity-icon">
                <DollarSign size={20} />
              </div>
              <div className="home-activity-content">
                <p className="home-activity-text">Payment received</p>
                <span className="home-activity-time">12 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
