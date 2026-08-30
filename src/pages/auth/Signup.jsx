import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Headphones, UserPlus, AlertCircle, CheckCircle2, ShieldAlert, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [workerBio, setWorkerBio] = useState('');
  const [workerSkills, setWorkerSkills] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        name,
        email,
        password,
        confirmPassword,
        role,
        workerBio,
        workerSkills,
      });

      if (role === 'worker') {
        setSuccessMsg(res.message || 'Worker application submitted successfully! Your account is pending Admin review.');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '3rem auto', width: '100%', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.75rem 2.25rem', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.85rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px var(--primary-glow)',
            }}
          >
            <Headphones size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Join SupportFlow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Create your account to get started in seconds
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

        {successMsg && (
          <div
            style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              color: 'var(--warning-text)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.92rem',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={20} color="var(--warning)" />
              Application Submitted
            </div>
            <p>{successMsg}</p>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Return to Login
              </Link>
            </div>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit}>
            {/* Visual Role Selector Cards */}
            <div className="form-group">
              <label className="form-label">Select Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${role === 'customer' ? 'var(--primary)' : 'var(--border)'}`,
                    background: role === 'customer' ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: role === 'customer' ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <User size={22} />
                  <strong style={{ fontSize: '0.9rem' }}>Customer</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Submit requests</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${role === 'worker' ? 'var(--primary)' : 'var(--border)'}`,
                    background: role === 'worker' ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: role === 'worker' ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Briefcase size={22} />
                  <strong style={{ fontSize: '0.9rem' }}>Worker</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Resolve issues</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {role === 'worker' && (
              <div
                style={{
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  animation: 'fade-in 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.85rem' }}>
                  <ShieldAlert size={16} /> Worker Verification Details (Reviewed by Admin)
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Hardware, Network, Database, Security"
                    value={workerSkills}
                    onChange={(e) => setWorkerSkills(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Short Experience Summary</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Brief overview of your technical background..."
                    value={workerBio}
                    onChange={(e) => setWorkerBio(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : role === 'worker' ? 'Submit Worker Application' : 'Create Customer Account'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
