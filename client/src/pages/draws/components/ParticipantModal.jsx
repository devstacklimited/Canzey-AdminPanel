import React from 'react';
import { X, Trophy } from 'lucide-react';

const ParticipantModal = ({ isOpen, onClose, draw, participants, loading, onPickWinner, activeTab }) => {
  if (!isOpen) return null;

  return (
    <div className="pool-modal">
      <div className="pool-modal-content">
        <div className="pool-modal-header">
          <div>
            <h2>Participants List</h2>
            <p>{draw?.product_name} - {draw?.campaign_title}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="pool-modal-body">
          {loading ? (
            <div className="modal-loader">Loading participants...</div>
          ) : participants.length === 0 ? (
            <div className="empty-state">
              <p>No tickets sold for this prize yet.</p>
            </div>
          ) : (
            <div className="ticket-pool-list">
              {participants.map((t) => (
                <div key={t.id} className="pool-participant-row">
                  <div className="participant-main">
                    <p className="participant-name">{t.customer_name}</p>
                    <p className="participant-ticket">TKT: {t.ticket_number}</p>
                  </div>
                  <div className="participant-contact">
                    <p>{t.customer_phone || 'No Phone'}</p>
                    <p>{t.customer_email}</p>
                  </div>
                  <div className="participant-order">
                    <small>Order #{t.order_number}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pool-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
          {activeTab === 'upcoming' && participants.length > 0 && (
            <button className="pick-winner-btn" onClick={() => onPickWinner(draw)}>
              Pick a Winner <Trophy size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;
