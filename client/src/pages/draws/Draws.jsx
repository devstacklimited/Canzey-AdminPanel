import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import DrawCard from './components/DrawCard';
import ParticipantModal from './components/ParticipantModal';
import './Draws.css';

const Draws = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [draws, setDraws] = useState({ upcoming: [], active: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [ticketPool, setTicketPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);
  const [showPoolModal, setShowPoolModal] = useState(false);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/draws`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setDraws({
          upcoming: response.data.upcoming || [],
          active: response.data.active || [],
          past: response.data.past || []
        });
      }
    } catch (error) {
      console.error('Error fetching draws:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = async (draw) => {
    setLoadingPool(true);
    setSelectedDraw(draw);
    setShowPoolModal(true);
    setTicketPool([]); // Reset pool while loading
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/draws/pool/${draw.product_id}/${draw.campaign_id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setTicketPool(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching ticket pool:', error);
    } finally {
      setLoadingPool(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onPickWinner = (draw) => {
    // Logic for picking winner will go here
    alert(`Picking winner for ${draw.product_name}... (Functionality coming soon)`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="draws-loading">
          <div className="loader"></div>
          <p>Loading Draw Center...</p>
        </div>
      </Layout>
    );
  }

  const currentList = activeTab === 'active' ? draws.active : 
                     activeTab === 'upcoming' ? draws.upcoming : 
                     draws.past;

  return (
    <Layout>
      <div className="draws-container">
        <div className="draws-header">
          <h1 className="draws-title">Lucky Draw Center</h1>
          <p className="draws-subtitle">Manage active campaigns, ready draws, and past winners</p>
        </div>

        <div className="draws-tabs">
          <button 
            className={`draw-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({draws.active.length})
          </button>
          <button 
            className={`draw-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Ready for Draw ({draws.upcoming.length})
          </button>
          <button 
            className={`draw-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Results ({draws.past.length})
          </button>
        </div>

        {currentList.length === 0 ? (
          <div className="empty-state">
            <Trophy size={64} className="empty-icon" />
            <h3>No {activeTab} draws found</h3>
            <p>Check back later for new updates.</p>
          </div>
        ) : (
          <div className="draws-grid">
            {currentList.map((draw) => (
              <DrawCard 
                key={`${draw.product_id}-${draw.campaign_id}`}
                draw={draw}
                activeTab={activeTab}
                onViewParticipants={handleViewParticipants}
                getImageUrl={getImageUrl}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        <ParticipantModal 
          isOpen={showPoolModal}
          onClose={() => setShowPoolModal(false)}
          draw={selectedDraw}
          participants={ticketPool}
          loading={loadingPool}
          onPickWinner={onPickWinner}
          activeTab={activeTab}
        />
      </div>
    </Layout>
  );
};

export default Draws;
