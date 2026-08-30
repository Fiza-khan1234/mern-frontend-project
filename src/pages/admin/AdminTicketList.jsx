import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, ArrowRight, Filter, Search } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';

export const AdminTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const res = await ticketService.getAllTickets(filters);
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status, priority]);

  const filteredTickets = tickets.filter((t) => {
    return (
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customer?.name && t.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.assignedWorker?.name && t.assignedWorker.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <Layers size={28} color="var(--primary)" /> Global Support Tickets
        </h1>
        <p className="page-subtitle">Master repository of all service inquiries, status progressions, and technician assignments.</p>
      </div>

      {/* Filter Controls & Search */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by ticket #, subject, customer, or worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Platform Requests</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredTickets.length}</strong> of {tickets.length} tickets
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading platform tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
            <Layers size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Tickets Found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No tickets match the specified criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Worker</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                      <div style={{ fontWeight: 700 }}>{t.customer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customer?.email}</div>
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
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.assignedWorker.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/requests/${t._id}`} className="btn btn-secondary btn-sm">
                        View <ArrowRight size={14} />
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
