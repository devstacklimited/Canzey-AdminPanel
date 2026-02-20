import React from 'react';
import { Ticket, Calendar, ChevronRight } from 'lucide-react';

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

  return (
    <div className="draw-card">
      <div className="draw-card-image">
        <img src={getImageUrl(draw.product_image)} alt={draw.product_name} />
        <span className={`draw-status-badge ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
      </div>
      
      <div className="draw-card-content">
        <p className="draw-card-prize">{draw.campaign_title}</p>
        <h3 className="draw-card-title">{draw.product_name}</h3>
        
        <div className="draw-info-row">
          <Ticket size={16} />
          <span>{draw.tickets_sold || 0} / {draw.tickets_required} Tickets Sold</span>
        </div>
        
        <div className="draw-info-row">
          <Calendar size={16} />
          <span>Internal Draw: {formatDate(draw.draw_date)}</span>
        </div>

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
