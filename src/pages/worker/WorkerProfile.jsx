import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, User, ArrowLeft, MessageSquare, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { workerService } from '../../services/workerService';
import { StarRating } from '../../components/common/StarRating';

export const WorkerProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await workerService.getProfile(id);
        setProfileData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load worker profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
        Loading technician reputation profile...
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1.5rem', fontWeight: 700 }}>{error || 'Worker profile not found.'}</p>
        <Link to="/worker/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { worker, reviews, averageRating, totalReviews } = profileData;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/worker/dashboard"
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
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <h1 className="page-title">
          <Award size={28} color="var(--primary)" /> Worker Profile & Customer Reviews
        </h1>
        <p className="page-subtitle">Verified customer feedback and real-time ratings recorded upon resolved service tickets.</p>
      </div>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              className="avatar-circle"
              style={{
                width: '72px',
                height: '72px',
                fontSize: '1.75rem',
                boxShadow: '0 8px 24px var(--primary-glow)',
              }}
            >
              {worker.name?.charAt(0) || 'W'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {worker.name}
                </h2>
                <span className="badge badge-accepted">Verified Worker</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {worker.email} • Registered {new Date(worker.createdAt).toLocaleDateString()}
              </div>
              {worker.workerBio && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.6rem', maxWidth: '500px' }}>
                  {worker.workerBio}
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, var(--bg-card), var(--bg-alt))',
              padding: '1.25rem 2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {averageRating > 0 ? averageRating : '5.0'}
            </div>
            <div style={{ margin: '0.45rem 0' }}>
              <StarRating rating={Math.round(averageRating || 5)} readonly size={20} showLabel={false} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
        </div>

        {worker.workerSkills && worker.workerSkills.length > 0 && (
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.65rem' }}>
              Certified Technical Skills
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {worker.workerSkills.map((s, idx) => (
                <span key={idx} className="badge badge-low" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews List */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--primary)" />
          Customer Testimonials ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <Star size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Reviews Yet</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Customer ratings will be displayed here as service requests reach resolution.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map((r) => (
              <div
                key={r._id}
                style={{
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {r.customer?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {r.customer?.name || 'Customer'}
                      </strong>
                      {r.ticket && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          on ticket <strong style={{ color: 'var(--primary)' }}>{r.ticket.ticketNumber}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <StarRating rating={r.rating} readonly size={17} showLabel={false} />
                </div>

                {r.comment && (
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0 0.75rem' }}>
                    "{r.comment}"
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Submitted on {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
