import { X, Trophy, User, Mail, Phone, Calendar, Hash, CheckCircle, Loader, Download } from 'lucide-react';

const ParticipantModal = ({ isOpen, onClose, draw, participants, loading, pickingWinner, onPickWinner, activeTab, formatDate }) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (!participants.length) return;

    const headers = ['Ticket Number', 'Order Number', 'Customer Name', 'Email', 'Phone', 'Purchase Date', 'Source'];
    const rows = participants.map(t => [
      t.ticket_number  || '',
      t.order_number   || '',
      t.customer_name  || '',
      t.customer_email || '',
      t.customer_phone || '',
      t.created_at ? new Date(t.created_at).toLocaleString() : '',
      t.source || 'purchase'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    const safeName = `${draw?.product_name || 'draw'}_${draw?.campaign_title || ''}`.replace(/[^a-z0-9]/gi, '_');
    link.href     = url;
    link.download = `participants_${safeName}_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pool-modal">
      <div className="pool-modal-content">
        <div className="pool-modal-header">
          <div>
            <h2>Participants List</h2>
            <p className="pool-subtitle">{draw?.product_name} — {draw?.campaign_title}</p>
            {participants.length > 0 && (
              <p className="pool-count">{participants.length} ticket{participants.length !== 1 ? 's' : ''} in the pool</p>
            )}
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
                <div>Customer</div>
                <div>Phone &amp; Email</div>
                <div>Purchase Date</div>
                {activeTab === 'upcoming' && <div>Action</div>}
              </div>
              {participants.map((t) => (
                <div key={t.id} className="pool-participant-row">
                  <div className="participant-id">
                    <div className="ticket-pill">
                      <Hash size={12} />
                      {t.ticket_number}
                    </div>
                    <small className="order-link">Order #{t.order_number}</small>
                    {t.source === 'donation' && (
                      <span className="donation-ticket-badge">💝 Donation</span>
                    )}
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

                  {activeTab === 'upcoming' && (
                    <div className="participant-action">
                      <button
                        className="row-mark-winner-btn"
                        onClick={() => onPickWinner(draw, t)}
                        disabled={pickingWinner}
                        title="Mark this ticket as winner"
                      >
                        {pickingWinner ? (
                          <Loader size={14} className="spin-icon" />
                        ) : (
                          <><CheckCircle size={14} /> Pick as Winner</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pool-modal-footer">
          {participants.length > 0 && (
            <button className="csv-export-btn" onClick={exportCSV} title="Download all participants as CSV">
              <Download size={16} />
              Export CSV ({participants.length} tickets)
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;
