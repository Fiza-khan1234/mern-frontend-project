import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, ToggleLeft, ToggleRight, CheckCircle2, XCircle, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers(roleFilter);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(id);
      await adminService.toggleUserStatus(id);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/admin/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '0.85rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Overview
        </Link>
        <h1 className="page-title">
          <Users size={28} color="var(--primary)" /> User Directory & Access Control
        </h1>
        <p className="page-subtitle">Manage customer, worker, and administrator accounts across the SupportFlow system.</p>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="tabs" style={{ margin: 0 }}>
          <button
            type="button"
            className={`tab-btn ${roleFilter === '' ? 'active' : ''}`}
            onClick={() => setRoleFilter('')}
          >
            All Accounts
          </button>
          <button
            type="button"
            className={`tab-btn ${roleFilter === 'customer' ? 'active' : ''}`}
            onClick={() => setRoleFilter('customer')}
          >
            Customers
          </button>
          <button
            type="button"
            className={`tab-btn ${roleFilter === 'worker' ? 'active' : ''}`}
            onClick={() => setRoleFilter('worker')}
          >
            Workers
          </button>
          <button
            type="button"
            className={`tab-btn ${roleFilter === 'admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Administrators
          </button>
        </div>

        <div className="search-input-wrapper" style={{ minWidth: '220px' }}>
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Registered Users</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Users Found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No accounts match the current filter or search criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Worker Approval</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Security Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {u.name?.charAt(0)}
                        </div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{u.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{u.email}</td>
                    <td>
                      <span className="brand-badge" style={{ fontSize: '0.72rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role === 'worker' ? (
                        <span
                          className={`badge ${
                            u.workerApprovalStatus === 'Approved'
                              ? 'badge-resolved'
                              : u.workerApprovalStatus === 'Rejected'
                              ? 'badge-rejected'
                              : 'badge-pending'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {u.workerApprovalStatus}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${u.isActive ? 'badge-resolved' : 'badge-rejected'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                        disabled={actionLoading === u._id}
                        onClick={() => handleToggleStatus(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
