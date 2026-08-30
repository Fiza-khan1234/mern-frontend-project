import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  CheckCircle2, 
  PlayCircle, 
  ShieldAlert, 
  Star, 
  Check, 
  X, 
  ArrowRight,
  User,
  Clock,
  Search,
  Briefcase,
  Zap
} from 'lucide-react';
import { workerService } from '../../services/workerService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';

export const WorkerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my-requests'
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { user } = useAuth();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, availRes, myRes] = await Promise.all([
        workerService.getStats(),
        workerService.getAvailableRequests(),
        workerService.getMyRequests(),
      ]);

      setStats(statsRes.stats);
      setAvailableRequests(availRes.tickets || []);
      setMyRequests(myRes.tickets || []);
    } catch (err) {
      console.error('Failed to load worker dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAccept = async (ticketId) => {
    try {
      setActionLoading(ticketId);
      await workerService.acceptRequest(ticketId);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (ticketId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      setActionLoading(ticketId);
      await workerService.rejectRequest(ticketId);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const filterList = (list) => {
    return list.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customer?.name && t.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesUrgent = onlyUrgent ? (t.priority === 'Urgent' || t.priority === 'Critical') : true;

      return matchesSearch && matchesUrgent;
    });
  };

  const filteredAvailable = filterList(availableRequests);
  const filteredMy = filterList(myRequests);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase size={28} color="var(--primary)" /> Worker Support Hub
          </h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Claim incoming customer requests and resolve assigned service tasks.</p>
        </div>
        {stats && (
          <Link
            to={`/worker/profile/${user?._id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              background: 'var(--bg-card)',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Your Rating
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {stats.averageRating > 0 ? stats.averageRating : '5.0'}
                </strong>
                <StarRating rating={Math.round(stats.averageRating || 5)} readonly size={16} showLabel={false} />
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({stats.totalReviews} reviews)</span>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Available Queue"
            value={stats.availableRequests}
            icon={<Inbox size={22} />}
            color="#b45309"
            bgColor="var(--warning-bg)"
          />
          <StatCard
            title="My Active Work"
            value={stats.acceptedRequests + stats.inProgressRequests}
            icon={<PlayCircle size={22} />}
            color="#1d4ed8"
            bgColor="var(--info-bg)"
          />
          <StatCard
            title="Critical / Urgent"
            value={stats.highPriorityRequests}
            icon={<ShieldAlert size={22} />}
            color="var(--danger)"
            bgColor="var(--danger-bg)"
          />
          <StatCard
            title="Resolved Total"
            value={stats.resolvedRequests}
            icon={<CheckCircle2 size={22} />}
            color="var(--success)"
            bgColor="var(--success-bg)"
          />
        </div>
      )}

      {/* Workspace Tabs & Quick Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="tabs" style={{ margin: 0 }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Requests ({availableRequests.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-requests')}
          >
            My Assigned Requests ({myRequests.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-input-wrapper" style={{ minWidth: '220px' }}>
            <Search size={15} className="search-input-icon" />
            <input
              type="text"
              className="form-control"
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
              placeholder="Filter requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`btn btn-sm ${onlyUrgent ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setOnlyUrgent(!onlyUrgent)}
          >
            <Zap size={14} /> Urgent Only
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading requests...
          </div>
        ) : activeTab === 'available' ? (
          <div>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Unclaimed Customer Tickets</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click Accept to claim a ticket. Other technicians cannot accept claimed tickets.
                </span>
              </div>
              <span className="brand-badge">{filteredAvailable.length} available</span>
            </div>

            {filteredAvailable.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
                <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Available Requests</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>All incoming customer requests have been claimed or resolved.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Submitted</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAvailable.map((t) => (
                      <tr key={t._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                          {t.ticketNumber}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{t.customer?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customer?.email}</div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{t.subject}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.category}</span>
                        </td>
                        <td>
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={actionLoading === t._id}
                              onClick={() => handleAccept(t._id)}
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={actionLoading === t._id}
                              onClick={() => handleReject(t._id)}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-alt)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Your Active & Resolved Tasks</h3>
            </div>

            {filteredMy.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
                <Inbox size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Assigned Requests</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Switch to the Available Requests tab to claim your first ticket.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Accepted At</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMy.map((t) => (
                      <tr key={t._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                          {t.ticketNumber}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{t.customer?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customer?.email}</div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{t.subject}</strong>
                        </td>
                        <td>
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {t.acceptedAt ? new Date(t.acceptedAt).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/worker/requests/${t._id}`} className="btn btn-secondary btn-sm">
                            Manage <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
