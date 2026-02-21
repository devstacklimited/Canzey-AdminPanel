import React from 'react';
import { Ticket, Calendar, ChevronRight, Clock, Trophy, Star } from 'lucide-react';

const DrawCard = ({ draw, activeTab, onViewParticipants, getImageUrl, formatDate }) => {
  const getStatusLabel = () => {
    if (activeTab === 'active') return '🟢 Live';
    if (activeTab === 'upcoming') return '⏳ Ready';
    return '🏆 Completed';
  };

  const getStatusClass = () => {
    if (activeTab === 'active') return 'status-live';
    if (activeTab === 'upcoming') return 'status-ready';
    return 'status-winner';
  };

  const isSoldOut = draw.tickets_remaining !== undefined
    ? draw.tickets_remaining <= 0
    : draw.tickets_sold >= draw.tickets_required;

  const ticketsSold = draw.tickets_required - (draw.tickets_remaining ?? 0);
  const progressPct = draw.tickets_required > 0
    ? Math.min(100, Math.round((ticketsSold / draw.tickets_required) * 100))
    : 0;

  return (
    <div className={`draw-card ${activeTab === 'past' ? 'draw-card-past' : ''}`}>
      <div className="draw-card-image">
        <img src={getImageUrl(draw.product_image)} alt={draw.product_name} />
        <span className={`draw-status-badge ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
        {isSoldOut && activeTab !== 'past' && (
          <span className="sold-out-overlay-badge">SOLD OUT</span>
        )}
        {activeTab === 'past' && (
          <div className="past-winner-overlay">
            <Trophy size={28} className="past-trophy-icon" />
          </div>
        )}
      </div>

      <div className="draw-card-content">
        <p className="draw-card-prize">{draw.campaign_title}</p>
        <h3 className="draw-card-title">{draw.product_name}</h3>

        {/* ── ACTIVE / UPCOMING ── */}
        {activeTab !== 'past' && (
          <>
            {/* Tickets progress bar */}
            <div className="draw-ticket-progress">
              <div className="draw-ticket-labels">
                <span className="draw-ticket-sold">
                  <Ticket size={14} /> {ticketsSold} sold
                </span>
                <span className="draw-ticket-total">{draw.tickets_required} total</span>
              </div>
              <div className="draw-progress-bar">
                <div
                  className="draw-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="draw-progress-pct">{progressPct}%</span>
            </div>

            {/* Draw Date */}
            {draw.draw_date ? (
              <div className="draw-info-row draw-draw-date-row">
                <Clock size={16} />
                <span>🎯 Draw: {formatDate(draw.draw_date)}</span>
              </div>
            ) : (
              <div className="draw-info-row draw-missing-date-row">
                <Clock size={16} />
                <span>⚠️ Draw Date Not Set</span>
              </div>
            )}

            {/* Prize End Date */}
            {draw.end_date && (
              <div className="draw-info-row draw-end-date-row">
                <Calendar size={16} />
                <span>🔴 Prize Ends: {formatDate(draw.end_date)}</span>
              </div>
            )}

            <button
              className="view-pool-btn"
              onClick={() => onViewParticipants(draw)}
            >
              {activeTab === 'upcoming' ? '🎰 View & Pick Winner' : 'View Participants'}
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* ── PAST WINNER CARD ── */}
        {activeTab === 'past' && (
          <div className="past-winner-section">
            <div className="past-congrats-banner">
              <Star size={14} className="congrats-star" />
              <span>Congratulations to our winner!</span>
              <Star size={14} className="congrats-star" />
            </div>

            <div className="past-winner-box">
              <div className="past-winner-avatar">
                {draw.winner_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="past-winner-details">
                <p className="past-winner-name">{draw.winner_name ?? 'Unknown'}</p>
                <div className="past-winner-ticket">
                  <Ticket size={13} />
                  <span>{draw.winner_ticket}</span>
                </div>
              </div>
            </div>

            <div className="past-draw-meta">
              <div className="past-draw-meta-row">
                <Trophy size={14} />
                <span>Draw completed: {formatDate(draw.draw_completed_at)}</span>
              </div>
              {draw.draw_date && (
                <div className="past-draw-meta-row">
                  <Calendar size={14} />
                  <span>Scheduled: {formatDate(draw.draw_date)}</span>
                </div>
              )}
              <div className="past-draw-meta-row">
                <Ticket size={14} />
                <span>{draw.tickets_required} total tickets sold</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawCard;
