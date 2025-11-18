import React, { useState } from 'react';
import { Ticket, Users, Calendar, Clock, DollarSign, Trophy, Eye, X, Mail, Phone, MapPin, CreditCard, Hash, Search, Filter } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './raffels.css';

const Raffles = () => {

  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const raffles = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max Giveaway',
      prize: 'iPhone 15 Pro Max - 256GB',
      totalTickets: 500,
      soldTickets: 387,
      ticketPrice: '$5',
      drawDate: '2024-02-01',
      status: 'active',
      endTime: '2024-02-01 18:00:00'
    },
    {
      id: 2,
      title: 'MacBook Pro M3 Raffle',
      prize: 'MacBook Pro 16" M3 Max',
      totalTickets: 1000,
      soldTickets: 856,
      ticketPrice: '$10',
      drawDate: '2024-02-15',
      status: 'active',
      endTime: '2024-02-15 20:00:00'
    },
    {
      id: 3,
      title: 'PlayStation 5 Bundle',
      prize: 'PS5 + 3 Games + Controller',
      totalTickets: 300,
      soldTickets: 300,
      ticketPrice: '$3',
      drawDate: '2024-01-20',
      status: 'completed',
      winner: 'John Doe',
      endTime: '2024-01-20 19:00:00'
    }
  ];

  const tickets = [
    {
      id: 1,
      raffleId: 1,
      userId: 'USR-001',
      userName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      ticketNumbers: [23, 145, 289],
      ticketCount: 3,
      purchaseDate: '2024-01-10 14:32:00',
      amount: '$15',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-ABC123'
    },
    {
      id: 2,
      raffleId: 1,
      userId: 'USR-002',
      userName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 234-5678',
      location: 'Los Angeles, USA',
      ticketNumbers: [45, 156],
      ticketCount: 2,
      purchaseDate: '2024-01-11 09:15:00',
      amount: '$10',
      paymentMethod: 'PayPal',
      transactionId: 'TXN-DEF456'
    },
    {
      id: 3,
      raffleId: 1,
      userId: 'USR-003',
      userName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1 (555) 345-6789',
      location: 'Chicago, USA',
      ticketNumbers: [78, 199, 234, 456, 489],
      ticketCount: 5,
      purchaseDate: '2024-01-12 16:45:00',
      amount: '$25',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-GHI789'
    },
    {
      id: 4,
      raffleId: 1,
      userId: 'USR-004',
      userName: 'Alice Brown',
      email: 'alice.brown@example.com',
      phone: '+1 (555) 456-7890',
      location: 'Miami, USA',
      ticketNumbers: [12],
      ticketCount: 1,
      purchaseDate: '2024-01-13 11:20:00',
      amount: '$5',
      paymentMethod: 'Apple Pay',
      transactionId: 'TXN-JKL012'
    }
  ];

  const handleRaffleClick = (raffle) => {
    setSelectedRaffle(raffle);
    setSelectedTicket(null);
  };

  const handleTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeModal = () => {
    setSelectedTicket(null);
  };

  const getRaffleTickets = () => {
    if (!selectedRaffle) return [];
    return tickets.filter(ticket => ticket.raffleId === selectedRaffle.id);
  };

  const filteredTickets = getRaffleTickets().filter(ticket => {
    const matchesSearch = ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.userId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const calculateProgress = (sold, total) => {
    return (sold / total) * 100;
  };

  return (
    <Layout>
      <div className="raffles-page">
        <div className="raffles-container">
          {/* Header */}
          <div className="raffles-header">
            <div className="raffles-header-content">
              <h1 className="raffles-title">Raffles Management</h1>
              <p className="raffles-subtitle">Manage all your raffle campaigns and participants</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="raffles-stats-grid">
            <div className="raffle-stat-card">
              <div className="raffle-stat-icon violet">
                <Ticket size={24} />
              </div>
              <div className="raffle-stat-content">
                <h3>3</h3>
                <p>Active Raffles</p>
              </div>
            </div>
            <div className="raffle-stat-card">
              <div className="raffle-stat-icon blue">
                <Users size={24} />
              </div>
              <div className="raffle-stat-content">
                <h3>1,543</h3>
                <p>Total Participants</p>
              </div>
            </div>
            <div className="raffle-stat-card">
              <div className="raffle-stat-icon green">
                <DollarSign size={24} />
              </div>
              <div className="raffle-stat-content">
                <h3>$12,450</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="raffle-stat-card">
              <div className="raffle-stat-icon orange">
                <Trophy size={24} />
              </div>
              <div className="raffle-stat-content">
                <h3>15</h3>
                <p>Completed Raffles</p>
              </div>
            </div>
          </div>

          {/* Raffles Grid */}
          <div className="raffles-section">
            <h2 className="section-title">All Raffles</h2>
            <div className="raffles-grid">
              {raffles.map((raffle) => (
                <div 
                  key={raffle.id} 
                  className={`raffle-card ${selectedRaffle?.id === raffle.id ? 'selected' : ''} ${raffle.status}`}
                  onClick={() => handleRaffleClick(raffle)}
                >
                  <div className="raffle-card-header">
                    <div className="raffle-info">
                      <h3>{raffle.title}</h3>
                      <p className="raffle-prize">{raffle.prize}</p>
                    </div>
                    <span className={`raffle-status-badge ${raffle.status}`}>
                      {raffle.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>

                  <div className="raffle-stats-row">
                    <div className="raffle-stat-item">
                      <Ticket size={18} />
                      <span>{raffle.soldTickets}/{raffle.totalTickets}</span>
                    </div>
                    <div className="raffle-stat-item">
                      <DollarSign size={18} />
                      <span>{raffle.ticketPrice}</span>
                    </div>
                    <div className="raffle-stat-item">
                      <Calendar size={18} />
                      <span>{raffle.drawDate}</span>
                    </div>
                  </div>

                  <div className="raffle-progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Tickets Sold</span>
                      <span className="progress-percentage">
                        {Math.round(calculateProgress(raffle.soldTickets, raffle.totalTickets))}%
                      </span>
                    </div>
                    <div className="raffle-progress-bar">
                      <div 
                        className="raffle-progress-fill" 
                        style={{ width: `${calculateProgress(raffle.soldTickets, raffle.totalTickets)}%` }}
                      ></div>
                    </div>
                  </div>

                  {raffle.status === 'completed' && raffle.winner && (
                    <div className="raffle-winner">
                      <Trophy size={16} />
                      <span>Winner: {raffle.winner}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tickets List */}
          {selectedRaffle && (
            <div className="tickets-section">
              <div className="tickets-header">
                <h2 className="section-title">
                  Participants for "{selectedRaffle.title}"
                </h2>
                <div className="tickets-info">
                  <Users size={20} />
                  <span>{getRaffleTickets().length} Participants</span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="tickets-controls">
                <div className="tickets-search">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="tickets-search-input"
                  />
                </div>
              </div>

              <div className="tickets-list">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-item">
                    <div className="ticket-item-header">
                      <div className="ticket-user-info">
                        <div className="ticket-user-avatar">
                          {ticket.userName.charAt(0)}
                        </div>
                        <div className="ticket-user-details">
                          <h4>{ticket.userName}</h4>
                          <p>{ticket.email}</p>
                        </div>
                      </div>
                      <div className="ticket-meta">
                        <div className="ticket-count-badge">
                          <Ticket size={16} />
                          <span>{ticket.ticketCount} Ticket{ticket.ticketCount > 1 ? 's' : ''}</span>
                        </div>
                        <span className="ticket-amount">{ticket.amount}</span>
                      </div>
                    </div>
                    
                    <div className="ticket-numbers">
                      <span className="ticket-numbers-label">Numbers:</span>
                      {ticket.ticketNumbers.map((num, idx) => (
                        <span key={idx} className="ticket-number-badge">#{num}</span>
                      ))}
                    </div>

                    <div className="ticket-item-footer">
                      <span className="ticket-date">
                        <Clock size={14} />
                        {ticket.purchaseDate}
                      </span>
                      <button 
                        className="ticket-detail-btn"
                        onClick={() => handleTicketDetail(ticket)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

                {filteredTickets.length === 0 && (
                  <div className="tickets-empty">
                    <Ticket size={48} />
                    <p>No tickets found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedRaffle && (
            <div className="no-raffle-selected">
              <Ticket size={64} />
              <h3>Select a Raffle</h3>
              <p>Click on a raffle card above to view participants and ticket details</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* User Information */}
              <div className="detail-section">
                <h3 className="detail-section-title">User Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{selectedTicket.userName}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Hash size={20} />
                    </div>
                    <div>
                      <span className="detail-label">User ID</span>
                      <span className="detail-value">{selectedTicket.userId}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedTicket.email}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{selectedTicket.phone}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{selectedTicket.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className="detail-section">
                <h3 className="detail-section-title">Ticket Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Ticket size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Ticket Count</span>
                      <span className="detail-value">{selectedTicket.ticketCount} Ticket{selectedTicket.ticketCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Total Amount</span>
                      <span className="detail-value">{selectedTicket.amount}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Purchase Date</span>
                      <span className="detail-value">{selectedTicket.purchaseDate}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Payment Method</span>
                      <span className="detail-value">{selectedTicket.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="detail-item full-width">
                    <div className="detail-icon">
                      <Hash size={20} />
                    </div>
                    <div>
                      <span className="detail-label">Transaction ID</span>
                      <span className="detail-value transaction-id">{selectedTicket.transactionId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Numbers */}
              <div className="detail-section">
                <h3 className="detail-section-title">Ticket Numbers</h3>
                <div className="ticket-numbers-grid">
                  {selectedTicket.ticketNumbers.map((num, idx) => (
                    <div key={idx} className="ticket-number-card">
                      #{num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Raffle Information */}
              <div className="detail-section">
                <h3 className="detail-section-title">Raffle Information</h3>
                <div className="raffle-info-box">
                  <div className="raffle-info-item">
                    <Trophy size={20} />
                    <div>
                      <span className="raffle-info-label">Prize</span>
                      <span className="raffle-info-value">{selectedRaffle.prize}</span>
                    </div>
                  </div>
                  <div className="raffle-info-item">
                    <Calendar size={20} />
                    <div>
                      <span className="raffle-info-label">Draw Date</span>
                      <span className="raffle-info-value">{selectedRaffle.drawDate}</span>
                    </div>
                  </div>
                  <div className="raffle-info-item">
                    <Clock size={20} />
                    <div>
                      <span className="raffle-info-label">Draw Time</span>
                      <span className="raffle-info-value">{selectedRaffle.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Raffles;