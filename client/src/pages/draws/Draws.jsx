import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, X, Star, Ticket } from 'lucide-react';
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
  const [pickingWinner, setPickingWinner] = useState(false);
  const [winnerResult, setWinnerResult] = useState(null);

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
    setTicketPool([]);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/admin/draws/pool/${draw.product_id}/${draw.campaign_id}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setTicketPool(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching ticket pool:', error);
    } finally {
      setLoadingPool(false);
    }
  };

  // 🎯 Mark a SPECIFIC ticket as winner — called when admin clicks "Pick as Winner" on a row
  const onPickWinner = async (draw, ticket) => {
    if (!window.confirm(`Mark "${ticket.customer_name}" (${ticket.ticket_number}) as the winner for "${draw.product_name}"?`)) return;

    setPickingWinner(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tickets/admin/mark-winner/${ticket.id}`,
        { is_winner: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setShowPoolModal(false);
      setWinnerResult({ winner: ticket, draw });

      await fetchDraws();
      setTimeout(() => setActiveTab('past'), 500);

    } catch (error) {
      console.error('Error marking winner:', error);
      alert('Failed to mark winner. Please try again.');
    } finally {
      setPickingWinner(false);
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
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
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
          <button className={`draw-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            Active ({draws.active.length})
          </button>
          <button className={`draw-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
            Ready for Draw ({draws.upcoming.length})
          </button>
          <button className={`draw-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
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
          pickingWinner={pickingWinner}
          onPickWinner={onPickWinner}
          activeTab={activeTab}
          formatDate={formatDate}
        />

        {/* 🏆 Winner Reveal Overlay */}
        {winnerResult && (
          <div className="winner-reveal-overlay" onClick={() => setWinnerResult(null)}>
            <div className="winner-reveal-card" onClick={e => e.stopPropagation()}>
              <button className="winner-reveal-close" onClick={() => setWinnerResult(null)}>
                <X size={20} />
              </button>
              <div className="winner-reveal-confetti">🎉 🎊 🎉 🎊 🎉</div>
              <div className="winner-reveal-trophy">🏆</div>
              <h2 className="winner-reveal-title">We Have a Winner!</h2>
              <p className="winner-reveal-prize">{winnerResult.draw.campaign_title}</p>
              <img
                className="winner-reveal-product-img"
                src={getImageUrl(winnerResult.draw.product_image)}
                alt={winnerResult.draw.product_name}
              />
              <h3 className="winner-reveal-product">{winnerResult.draw.product_name}</h3>
              <div className="winner-reveal-winner-box">
                <div className="winner-reveal-avatar">
                  {winnerResult.winner.customer_name?.[0]?.toUpperCase()}
                </div>
                <div className="winner-reveal-winner-info">
                  <p className="winner-reveal-name">{winnerResult.winner.customer_name}</p>
                  <div className="winner-reveal-ticket">
                    <Ticket size={14} />
                    {winnerResult.winner.ticket_number}
                  </div>
                </div>
              </div>
              <p className="winner-reveal-message">
                🎉 Congratulations! The lucky ticket has been drawn. Please contact the winner to arrange prize delivery.
              </p>
              <button className="winner-reveal-done-btn" onClick={() => setWinnerResult(null)}>
                <Star size={16} /> View Past Results
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Draws;
