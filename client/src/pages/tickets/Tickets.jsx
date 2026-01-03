import React, { useState, useEffect } from 'react';
import { Search, Filter, Ticket, User, Package, Calendar, Award } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Toast from '../../components/ui/Toast';
import './Tickets.css';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalTickets: 0,
    activeTickets: 0,
    totalCampaigns: 0,
    fromPurchases: 0
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/tickets/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.tickets || []);
        calculateStats(data.tickets || []);
      } else {
        setToast({ type: 'error', message: 'Failed to fetch tickets' });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setToast({ type: 'error', message: 'Error loading tickets' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData) => {
    const totalTickets = ticketsData.length;
    const activeTickets = ticketsData.filter(t => t.status === 'active').length;
    const uniqueCampaigns = new Set(ticketsData.map(t => t.campaign_id)).size;
    const fromPurchases = ticketsData.filter(t => t.source === 'purchase').length;

    setStats({
      totalTickets,
      activeTickets,
      totalCampaigns: uniqueCampaigns,
      fromPurchases
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'used': return 'status-used';
      case 'expired': return 'status-expired';
      case 'won': return 'status-won';
      default: return 'status-active';
    }
  };

  const statsData = [
    {
      icon: <Ticket size={24} />,
      title: 'Total Tickets',
      value: stats.totalTickets.toString(),
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: <Award size={24} />,
      title: 'Active Tickets',
      value: stats.activeTickets.toString(),
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: <Package size={24} />,
      title: 'Campaigns',
      value: stats.totalCampaigns.toString(),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <User size={24} />,
      title: 'From Purchases',
      value: stats.fromPurchases.toString(),
      color: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Campaign Tickets
            </h1>
            <p className="text-gray-600 text-lg">View all campaign tickets from orders</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tickets, orders, customers, campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all min-w-[180px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                  <option value="won">Won</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ticket Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Campaign</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Source</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                          <span className="ml-3 text-gray-600">Loading tickets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Ticket size={18} className="text-violet-600" />
                            <span className="font-mono font-semibold text-violet-600">{ticket.ticket_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{ticket.campaign_title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                              {ticket.customer_name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-gray-900">{ticket.customer_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {ticket.order_number ? (
                            <span className="font-mono text-sm text-gray-600">{ticket.order_number}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                            ticket.source === 'purchase' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.source}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(ticket.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12">
                        <div className="text-center">
                          <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No tickets found</p>
                          <p className="text-gray-400">Tickets will appear here when customers make purchases</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tickets;
