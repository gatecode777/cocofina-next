'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { orderAPI, userAPI, adminProductAPI } from '@/services/api';
import '@/styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    placedOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user stats
      const userStatsResponse = await userAPI.getStats();
      const usersResponse = await userAPI.getAll({ page: 1, limit: 5 });

      // Fetch product stats
      const productStatsResponse = await adminProductAPI.getStats();

      // Fetch order stats and recent orders
      const orderStatsResponse = await orderAPI.getOrderStats();
      const recentOrdersResponse = await orderAPI.getAllOrders({ 
        page: 1, 
        limit: 5,
        sort: '-createdAt'
      });
      
      // Combine stats
      const userStats = userStatsResponse.data.stats || {};
      const productStats = productStatsResponse.data.stats || {};
      const orderStats = orderStatsResponse.data.stats || {};

      setStats({
        totalUsers: userStats.totalUsers || 0,
        totalProducts: productStats.totalProducts || 0,
        totalOrders: orderStats.total || 0,
        totalRevenue: orderStats.revenue || 0,
        placedOrders: orderStats.placed || 0,
        processingOrders: orderStats.processing || 0,
        deliveredOrders: orderStats.delivered || 0,
        cancelledOrders: orderStats.cancelled || 0,
      });

      setRecentUsers(usersResponse.data.users || []);
      setRecentOrders(recentOrdersResponse.data.orders || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'placed': '#f59e0b',
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'shipped': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'placed': 'fa-clock',
      'confirmed': 'fa-check-circle',
      'processing': 'fa-cog',
      'shipped': 'fa-truck',
      'delivered': 'fa-check-double',
      'cancelled': 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-users">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card stat-products">
            <div className="stat-icon">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalProducts.toLocaleString()}</h3>
              <p>Total Products</p>
            </div>
          </div>

          <div className="stat-card stat-orders">
            <div className="stat-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalOrders.toLocaleString()}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <i className="fas fa-rupee-sign"></i>
            </div>
            <div className="stat-info">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link href="/admin/products/new" className="action-card">
              <i className="fas fa-plus-circle"></i>
              <span>Add New Product</span>
            </Link>
            <Link href="/admin/users" className="action-card">
              <i className="fas fa-user-plus"></i>
              <span>View All Users</span>
            </Link>
            <Link href="/admin/orders" className="action-card">
              <i className="fas fa-list-alt"></i>
              <span>View Orders</span>
            </Link>
            <Link href="/admin/categories" className="action-card">
              <i className="fas fa-tags"></i>
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-content">
          <div className="content-section">
            <div className="section-header-a">
              <h2>Recent Users</h2>
              <Link href="/admin/users" className="view-all">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="table-container">
              {recentUsers.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-users"></i>
                  <p>No users found</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/admin/users/${user._id}`} className="btn-view">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="content-section">
            <div className="section-header-a">
              <h2>Recent Orders</h2>
              <Link href="/admin/orders" className="view-all">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="table-container">
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-shopping-cart"></i>
                  <p>No orders found</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-number">{order.orderNumber}</span>
                        </td>
                        <td>
                          {order.user ? (
                            <>
                              {order.user.firstName} {order.user.lastName}
                            </>
                          ) : (
                            order.shippingAddress?.fullName || 'N/A'
                          )}
                        </td>
                        <td>₹{order?.total?.toLocaleString()}</td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ 
                              backgroundColor: getStatusColor(order.status),
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <i className={`fas ${getStatusIcon(order.status)}`}></i>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/admin/orders/${order._id}`} className="btn-view">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;