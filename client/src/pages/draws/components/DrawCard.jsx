import React from 'react';
import { Ticket, Calendar, ChevronRight, Clock } from 'lucide-react';

const DrawCard = ({ draw, activeTab, onViewParticipants, getImageUrl, formatDate }) => {
  const getStatusLabel = () => {
    if (activeTab === 'active') return 'Live';
    if (activeTab === 'upcoming') return 'Ready';
    return 'Completed';
  };

  const getStatusClass = () => {
    if (activeTab === 'past') return 'status-winner';
    return 'status-ready';
  };

  const isSoldOut = draw.tickets_remaining !== undefined
    ? draw.tickets_remaining <= 0
    : draw.tickets_sold >= draw.tickets_required;

  return (
    <div className="draw-card">
      <div className="draw-card-image">
        <img src={getImageUrl(draw.product_image)} alt={draw.product_name} />
        <span className={`draw-status-badge ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
        {isSoldOut && activeTab !== 'past' && (
          <span className="sold-out-overlay-badge">SOLD OUT</span>
        )}
      </div>
      
      <div className="draw-card-content">
        <p className="draw-card-prize">{draw.campaign_title}</p>
        <h3 className="draw-card-title">{draw.product_name}</h3>
        
        {/* Tickets Sold Row */}
        <div className={`draw-info-row ${isSoldOut && activeTab !== 'past' ? 'sold-out-row' : ''}`}>
          <Ticket size={16} />
          <span>
            {draw.tickets_sold || 0} / {draw.tickets_required} Tickets Sold
            {isSoldOut && activeTab !== 'past' && (
              <span className="inline-sold-out-badge"> · SOLD OUT</span>
            )}
          </span>
        </div>
        
        {/* Campaign End Date */}
        <div className="draw-info-row">
          <Calendar size={16} />
          <span>Campaign End Date: {formatDate(draw.campaign_end_at)}</span>
        </div>

        {/* Prize End Date — always show if set, even when sold out */}
        {draw.end_date && (
          <div className="draw-info-row draw-end-date-row">
            <Calendar size={16} />
            <span>🔴 Prize Ends: {formatDate(draw.end_date)}</span>
          </div>
        )}

        {/* Draw Date — show if set */}
        {draw.draw_date && (
          <div className="draw-info-row draw-draw-date-row">
            <Clock size={16} />
            <span>🎯 Draw Date: {formatDate(draw.draw_date)}</span>
          </div>
        )}

        {!draw.draw_date && isSoldOut && activeTab !== 'past' && (
          <div className="draw-info-row draw-missing-date-row">
            <Clock size={16} />
            <span>⚠️ Draw Date: Not Set</span>
          </div>
        )}

        {activeTab !== 'past' ? (
          <button 
            className="view-pool-btn"
            onClick={() => onViewParticipants(draw)}
          >
            View Participants <ChevronRight size={18} />
          </button>
        ) : (
          <div className="draw-card-footer">
            <div className="winner-info">
              <div className="winner-avatar">
                {draw.winner_name?.[0]}
              </div>
              <div className="winner-details">
                <p>{draw.winner_name}</p>
                <p>{draw.winner_ticket}</p>
              </div>
            </div>
            <div className="draw-date-pill">
              {formatDate(draw.draw_completed_at)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawCard;
