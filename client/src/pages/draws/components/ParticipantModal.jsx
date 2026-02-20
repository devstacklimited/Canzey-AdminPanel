import { X, Trophy, User, Mail, Phone, Calendar, Hash } from 'lucide-react';

const ParticipantModal = ({ isOpen, onClose, draw, participants, loading, onPickWinner, activeTab, formatDate }) => {
  if (!isOpen) return null;

  return (
    <div className="pool-modal">
      <div className="pool-modal-content">
        <div className="pool-modal-header">
          <div>
            <h2>Participants List</h2>
            <p className="pool-subtitle">{draw?.product_name} - {draw?.campaign_title}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="pool-modal-body">
          {loading ? (
            <div className="modal-loader-container">
              <div className="modal-loader"></div>
              <p>Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="empty-state">
              <Trophy size={48} className="empty-icon" />
              <p>No tickets sold for this prize yet.</p>
            </div>
          ) : (
            <div className="ticket-pool-list">
              <div className="pool-table-header">
                <div>Ticket INFO</div>
                <div>Customer Details</div>
                <div>Phone & Email</div>
                <div>Purchase Date</div>
              </div>
              {participants.map((t) => (
                <div key={t.id} className="pool-participant-row">
                  <div className="participant-id">
                    <div className="ticket-pill">
                      <Hash size={12} />
                      {t.ticket_number}
                    </div>
                    <small className="order-link">Order #{t.order_number}</small>
                  </div>

                  <div className="participant-main">
                    <div className="info-with-icon">
                      <User size={14} />
                      <p className="participant-name">{t.customer_name}</p>
                    </div>
                  </div>

                  <div className="participant-contact">
                    <div className="info-with-icon">
                      <Mail size={14} />
                      <p>{t.customer_email}</p>
                    </div>
                    <div className="info-with-icon">
                      <Phone size={14} />
                      <p>{t.customer_phone || 'No Phone'}</p>
                    </div>
                  </div>

                  <div className="participant-date">
                    <div className="info-with-icon">
                      <Calendar size={14} />
                      <p>{formatDate(t.created_at)}</p>
                    </div>
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
