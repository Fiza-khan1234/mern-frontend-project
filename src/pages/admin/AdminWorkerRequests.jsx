import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Check, X, ArrowLeft, Clock, ShieldAlert, CheckCircle2, XCircle, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminWorkerRequests = () => {
  const [workers, setWorkers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending Approval');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getWorkerRequests(statusFilter);
      setWorkers(res.workers || []);
    } catch (err) {
      console.error('Failed to load worker requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await adminService.approveWorker(id);
      await loadWorkers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve worker');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this worker application?')) return;
    try {
      setActionLoading(id);
      await adminService.rejectWorker(id);
      await loadWorkers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject worker');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredWorkers = workers.filter((w) => {
    return (
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.workerSkills && w.workerSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())))
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
        <h1 className="page-title">Worker Application Review</h1>
        <p className="page-subtitle">Evaluate technician applications. Approved workers instantly receive access to claim and resolve customer tickets.</p>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="tabs" style={{ margin: 0 }}>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'Pending Approval' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pending Approval')}
          >
            Pending Review
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'Approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Approved')}
          >
            Approved Technicians
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'Rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Rejected')}
          >
            Rejected Applications
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All Submissions
          </button>
        </div>

        <div className="search-input-wrapper" style={{ minWidth: '220px' }}>
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading worker requests...
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
            <UserCheck size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Worker Applications Found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No worker applications match the selected filter ({statusFilter || 'All'}).</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Email</th>
                  <th>Skills & Technical Bio</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {w.name?.charAt(0)}
                        </div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{w.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{w.email}</span>
                    </td>
                    <td>
                      {w.workerSkills && w.workerSkills.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.35rem' }}>
                          {w.workerSkills.map((s, idx) => (
                            <span key={idx} className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {w.workerBio && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.4 }}>
                          {w.workerBio}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          w.workerApprovalStatus === 'Approved'
                            ? 'badge-resolved'
                            : w.workerApprovalStatus === 'Rejected'
                            ? 'badge-rejected'
                            : 'badge-pending'
                        }`}
                      >
                        {w.workerApprovalStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {w.workerApprovalStatus !== 'Approved' && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={actionLoading === w._id}
                            onClick={() => handleApprove(w._id)}
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {w.workerApprovalStatus !== 'Rejected' && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading === w._id}
                            onClick={() => handleReject(w._id)}
                          >
                            <X size={14} /> Reject
                          </button>
                        )}
                      </div>
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
