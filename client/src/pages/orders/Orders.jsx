import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Clock, CheckCircle, XCircle, Truck, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Toast from '../../components/ui/Toast';
import OrderDetailsModal from './components/OrderDetailsModal';
import { API_BASE_URL } from '../../config/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        calculateStats(data.orders || []);
      } else {
        setToast({ type: 'error', message: 'Failed to fetch orders' });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToast({ type: 'error', message: 'Error loading orders' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const totalRevenue = ordersData
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    
    const uniqueCustomers = new Set(ordersData.map(o => o.customer_id)).size;
    const pendingOrders = ordersData.filter(o => o.order_status === 'pending').length;

    setStats({
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders: ordersData.length,
      totalCustomers: uniqueCustomers,
      pendingOrders: pendingOrders
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setToast({ type: 'success', message: 'Order status updated!' });
        fetchOrders();
      } else {
        setToast({ type: 'error', message: data.message || 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ type: 'error', message: 'Error updating status' });
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedOrder(data.order);
        setShowDetailsModal(true);
      } else {
        setToast({ type: 'error', message: 'Failed to load order details' });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setToast({ type: 'error', message: 'Error loading order details' });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={20} />;
      case 'pending': return <Clock size={20} />;
      case 'processing': return <Package size={20} />;
      case 'shipped': return <Truck size={20} />;
      case 'cancelled': return <XCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.first_name || ''} ${order.last_name || ''}`.toLowerCase();
    const matchesSearch = 
      customerName.includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.order_status === filterStatus;
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

  const statsData = [
    {
      icon: <DollarSign size={24} />,
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: <ShoppingCart size={24} />,
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <Users size={24} />,
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: <Calendar size={24} />,
      title: 'Pending',
      value: stats.pendingOrders.toString(),
      color: 'from-amber-500 to-orange-600'
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

          {/* Order Details Modal */}
          <OrderDetailsModal 
            show={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            order={selectedOrder}
          />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Orders Management
            </h1>
            <p className="text-gray-600 text-lg">Track and manage all customer orders</p>
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
                  placeholder="Search orders, customers, emails..."
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                          <span className="ml-3 text-gray-600">Loading orders...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-violet-600">{order.order_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {(order.first_name || 'U').charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 block">
                                {order.first_name} {order.last_name}
                              </span>
                              <span className="text-xs text-gray-500">{order.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="bg-gray-100 px-2 py-1 rounded-lg text-sm font-medium">
                            {order.items_count} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)}
                            <span className="capitalize">{order.order_status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">${order.total_amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <select
                              value={order.order_status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                              title="Update Status"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12">
                        <div className="text-center">
                          <Package size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No orders found</p>
                          <p className="text-gray-400">Orders will appear here when customers make purchases</p>
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

export default Orders;