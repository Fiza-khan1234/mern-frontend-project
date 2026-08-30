import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Send, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { PriorityBadge } from '../../components/common/Badge';

export const CreateRequest = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Local deterministic rule-based live analysis preview
  const getLiveTriage = () => {
    const text = `${subject} ${description}`.toLowerCase();
    
    let assessedCat = 'General';
    let matchedKeywords = [];

    if (text.includes('refund') || text.includes('invoice') || text.includes('payment') || text.includes('charge')) {
      assessedCat = 'Billing';
      matchedKeywords = ['billing', 'payment'];
    } else if (text.includes('outage') || text.includes('system down') || text.includes('security breach')) {
      assessedCat = 'Urgent Support';
      matchedKeywords = ['outage', 'emergency'];
    } else if (text.includes('password') || text.includes('login') || text.includes('2fa') || text.includes('locked')) {
      assessedCat = 'Account';
      matchedKeywords = ['access', 'password'];
    } else if (text.includes('wifi') || text.includes('network') || text.includes('connection') || text.includes('dns')) {
      assessedCat = 'Network';
      matchedKeywords = ['connectivity', 'dns'];
    } else if (text.includes('laptop') || text.includes('screen') || text.includes('battery') || text.includes('hardware')) {
      assessedCat = 'Hardware';
      matchedKeywords = ['device', 'hardware'];
    } else if (text.includes('bug') || text.includes('crash') || text.includes('error') || text.includes('failed')) {
      assessedCat = 'Technical';
      matchedKeywords = ['exception', 'bug'];
    }

    let assessedPriority = 'Medium';
    if (text.includes('outage') || text.includes('system down') || text.includes('emergency') || text.includes('data loss')) {
      assessedPriority = 'Urgent';
    } else if (text.includes('blocking') || text.includes('cannot access') || text.includes('asap')) {
      assessedPriority = 'Critical';
    } else if (text.includes('crash') || text.includes('error') || text.includes('broken')) {
      assessedPriority = 'High';
    } else if (text.includes('minor') || text.includes('typo') || text.includes('suggestion')) {
      assessedPriority = 'Low';
    }

    const confidence = subject || description ? (matchedKeywords.length > 0 ? 92 : 75) : 50;

    return { category: assessedCat, priority: assessedPriority, confidence, keywords: matchedKeywords };
  };

  const triage = getLiveTriage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both subject and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await ticketService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category: category !== 'General' ? category : triage.category,
      });

      navigate(`/requests/${res.ticket._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/dashboard"
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
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="page-title">Create Service Request</h1>
        <p className="page-subtitle">
          Describe the problem or service needed. Our automated rule-based AI triage will categorize and route it directly to eligible workers.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} flexShrink={0} color="var(--danger)" />
          <span>{error}</span>
        </div>
      )}

      {/* Live AI Triage Assistant Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-alt))',
          border: '1px solid var(--primary-glow)',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
            <Sparkles size={18} /> Deterministic Rule-Based AI Triage (Live)
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Confidence: <strong>{triage.confidence}%</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
              Detected Category
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {triage.category}
            </strong>
          </div>

          <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Initial Priority
            </span>
            <PriorityBadge priority={triage.priority} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject / Issue Summary *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Database connection timeout on checkout"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category (Optional override)</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">Auto-Detect via AI Triage ({triage.category})</option>
              <option value="Technical">Technical / Bug</option>
              <option value="Billing">Billing & Payments</option>
              <option value="Account">Account Access</option>
              <option value="Network">Network & Connectivity</option>
              <option value="Hardware">Hardware / Device</option>
              <option value="Urgent Support">Urgent Support</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Full Problem Description *</label>
            <textarea
              className="form-control"
              required
              rows={6}
              placeholder="Please provide details about the problem, error messages received, steps to reproduce, or service requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !subject.trim() || !description.trim()}
            >
              <Send size={18} />
              {loading ? 'Submitting Request...' : 'Submit Service Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
