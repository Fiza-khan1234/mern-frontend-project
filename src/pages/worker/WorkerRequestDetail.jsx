import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Play, 
  Check, 
  X, 
  Flame,
  ShieldCheck,
  Tag,
  Sliders
} from 'lucide-react';
import { workerService } from '../../services/workerService';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { StatusStepper } from '../../components/common/StatusStepper';
import { ConversationBox } from '../../components/chat/ConversationBox';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export const WorkerRequestDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);

  const { socket } = useSocket();
  const { user } = useAuth();

  const loadTicket = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getTicketById(id);
      setTicket(res.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  // Real-time listener for status/priority updates
  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusUpdate = ({ ticketId, status }) => {
      if (ticketId === id) {
        setTicket((prev) => (prev ? { ...prev, status } : prev));
      }
    };

    const handlePriorityUpdate = ({ ticketId, priority }) => {
      if (ticketId === id) {
        setTicket((prev) => (prev ? { ...prev, priority } : prev));
      }
    };

    socket.on('ticket-status-updated', handleStatusUpdate);
    socket.on('ticket-priority-updated', handlePriorityUpdate);

    return () => {
      socket.off('ticket-status-updated', handleStatusUpdate);
      socket.off('ticket-priority-updated', handlePriorityUpdate);
    };
  }, [socket, id]);

  const handleStatusTransition = async (nextStatus) => {
    try {
      setActionLoading(true);
      const res = await workerService.updateStatus(id, nextStatus);
      setTicket(res.ticket);
    } catch (err) {
      alert(err.response?.data?.message || 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setPriorityLoading(true);
      const res = await workerService.updatePriority(id, newPriority);
      setTicket(res.ticket);
    } catch (err) {
      alert(err.response?.data?.message || 'Priority update failed');
    } finally {
      setPriorityLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
        Loading request details...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ maxWidth: '580px', margin: '4rem auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Request Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>{error}</p>
        <Link to="/worker/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
      </div>
    );
  }

  const isAssignedToMe = ticket.assignedWorker && (ticket.assignedWorker._id === user?._id || ticket.assignedWorker === user?._id);
  const isFinalized = ticket.status === 'Resolved' || ticket.status === 'Rejected';

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/worker/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Worker Hub
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.15rem' }}>
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {ticket.subject}
            </h1>
          </div>

          {/* ONE-WAY STATE TRANSITION ACTION BUTTONS */}
          {isAssignedToMe && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {ticket.status === 'Accepted' && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('In Progress')}
                >
                  <Play size={18} /> Start Work (In Progress)
                </button>
              )}

              {ticket.status === 'In Progress' && (
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('Resolved')}
                >
                  <CheckCircle2 size={18} /> Mark as Resolved
                </button>
              )}

              {isFinalized && (
                <div
                  style={{
                    background: 'var(--bg-alt)',
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Status Finalized ({ticket.status})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Status Stepper */}
      <StatusStepper status={ticket.status} />

      <div className="grid grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Left 2 Cols: Details & Conversation */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Issue Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Customer Request Details
            </h3>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {ticket.description}
            </p>

            {ticket.aiTriage && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.35rem' }}>
                  <Sparkles size={15} /> AI Triage Assessment
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {ticket.aiTriage.summary} (Confidence: {Math.round((ticket.aiTriage.confidence || 0.85) * 100)}%)
                </div>
              </div>
            )}
          </div>

          {/* Real-time Conversation Box */}
          <ConversationBox ticketId={ticket._id} isClosed={isFinalized} />
        </div>

        {/* Right 1 Col: Customer Information & Operational Priority Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Info Card */}
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Customer Information
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="avatar-circle" style={{ width: '42px', height: '42px', fontSize: '1rem' }}>
                {ticket.customer?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {ticket.customer?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {ticket.customer?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Priority Management (Assigned Worker Only) */}
          {isAssignedToMe && (
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Operational Priority Control
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                As the assigned worker, you control the operational priority of this ticket.
              </p>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Set Priority Level</label>
                <select
                  className="form-control"
                  value={ticket.priority}
                  disabled={priorityLoading || isFinalized}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Priority</option>
                  <option value="Urgent">Urgent Priority (Top Escalation)</option>
                </select>
              </div>
            </div>
          )}

          {/* Status Progression Rules Info */}
          <div className="card" style={{ background: 'var(--bg-alt)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Workflow Progression Rules
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>• <strong>Pending</strong> ➔ Claim via Accept / Reject</div>
              <div>• <strong>Accepted</strong> ➔ Transition to In Progress</div>
              <div>• <strong>In Progress</strong> ➔ Mark as Resolved</div>
              <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                * Strict state machine: finalized states cannot be changed backwards.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
