import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Search,
  Filter,
  Layers,
  ArrowRight,
  Headphones,
  SlidersHorizontal
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';

export const CustomerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const res = await ticketService.getMyRequests();
        setTickets(res.tickets || []);
      } catch (err) {
        console.error('Failed to load customer requests:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const total = tickets.length;
  const pending = tickets.filter((t) => t.status === 'Pending').length;
  const inProgress = tickets.filter((t) => t.status === 'Accepted' || t.status === 'In Progress').length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedWorker?.name && t.assignedWorker.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Headphones size={28} color="var(--primary)" /> Customer Support Hub
          </h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Monitor active service requests and communicate directly with technicians.</p>
        </div>
        <Link to="/requests/new" className="btn btn-primary btn-lg">
          <PlusCircle size={18} /> Submit New Request
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Requests"
          value={total}
          icon={<Layers size={22} />}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />
        <StatCard
          title="Pending Claims"
          value={pending}
          icon={<Clock size={22} />}
          color="#b45309"
          bgColor="var(--warning-bg)"
        />
        <StatCard
          title="Active / In Progress"
          value={inProgress}
          icon={<PlayCircle size={22} />}
          color="#1d4ed8"
          bgColor="var(--info-bg)"
        />
        <StatCard
          title="Resolved Solutions"
          value={resolved}
          icon={<CheckCircle2 size={22} />}
          color="var(--success)"
          bgColor="var(--success-bg)"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by ticket #, subject, category, or worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Service & Support Inquiries</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredTickets.length}</strong> of {tickets.length} requests
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading support requests...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <Headphones size={44} style={{ margin: '0 auto 1rem', color: 'var(--primary)', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              No Requests Match Your Filter
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {tickets.length === 0
                ? "You haven't submitted any service or support requests yet."
                : 'Try adjusting your search keywords or filter criteria.'}
            </p>
            {tickets.length === 0 && (
              <Link to="/requests/new" className="btn btn-primary">
                <PlusCircle size={16} /> Create Your First Request
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Technician</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                        {t.ticketNumber}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{t.subject}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.category}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      {t.assignedWorker ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="avatar-circle" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                            {t.assignedWorker.name?.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {t.assignedWorker.name}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Waiting for worker
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/requests/${t._id}`} className="btn btn-secondary btn-sm">
                        View Details <ArrowRight size={14} />
                      </Link>
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
