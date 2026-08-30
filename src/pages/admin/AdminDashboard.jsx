import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Headphones,
  Shield,
  Activity,
  Briefcase
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        setStats(res.stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const resolutionRate = stats?.totalRequests > 0
    ? Math.round((stats.resolvedRequests / stats.totalRequests) * 100)
    : 100;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Shield size={28} color="var(--primary)" /> Administrator Command Center
          </h1>
          <p className="page-subtitle">Platform-wide governance, worker approval queue, and service request metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/worker-requests" className="btn btn-primary btn-lg">
            <UserCheck size={18} /> Review Worker Applications
          </Link>
          <Link to="/admin/tickets" className="btn btn-secondary btn-lg">
            <Layers size={18} /> All Platform Tickets
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
          Loading administrative analytics...
        </div>
      ) : stats ? (
        <>
          {/* Main Statistics Grid */}
          <div className="grid grid-cols-4" style={{ marginBottom: '1.75rem' }}>
            <StatCard
              title="Registered Customers"
              value={stats.totalCustomers}
              icon={<Users size={22} />}
              color="var(--primary)"
              bgColor="var(--primary-light)"
              subtitle="Active customer accounts"
            />
            <StatCard
              title="Approved Workers"
              value={stats.approvedWorkers}
              icon={<Briefcase size={22} />}
              color="var(--success)"
              bgColor="var(--success-bg)"
              subtitle="Eligible service technicians"
            />
            <StatCard
              title="Pending Applications"
              value={stats.pendingWorkerApplications}
              icon={<Clock size={22} />}
              color="#b45309"
              bgColor="var(--warning-bg)"
              subtitle="Awaiting admin review"
            />
            <StatCard
              title="Resolution Rate"
              value={`${resolutionRate}%`}
              icon={<Activity size={22} />}
              color="#0ea5e9"
              bgColor="var(--secondary-light)"
              subtitle={`${stats.resolvedRequests} of ${stats.totalRequests} resolved`}
            />
          </div>

          <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Total Requests Submitted"
              value={stats.totalRequests}
              icon={<Layers size={22} />}
              color="#1d4ed8"
              bgColor="var(--info-bg)"
            />
            <StatCard
              title="Unclaimed / Pending"
              value={stats.pendingRequests}
              icon={<Clock size={22} />}
              color="#b45309"
              bgColor="var(--warning-bg)"
            />
            <StatCard
              title="Completed & Resolved"
              value={stats.resolvedRequests}
              icon={<CheckCircle2 size={22} />}
              color="var(--success)"
              bgColor="var(--success-bg)"
            />
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-2">
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--warning-bg)', color: '#b45309', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Worker Review Queue</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Onboarding verification</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                There are currently <strong>{stats.pendingWorkerApplications}</strong> worker applications awaiting your review. Approving a worker immediately grants them access to claim customer tickets.
              </p>
              <Link to="/admin/worker-requests" className="btn btn-primary btn-sm">
                Open Review Hub <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--info-bg)', color: '#1d4ed8', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>User Management Directory</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security & access control</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Oversee all <strong>{stats.totalCustomers + stats.totalWorkers}</strong> registered customer and technician accounts across the platform. Activate or deactivate accounts with 1-click.
              </p>
              <Link to="/admin/users" className="btn btn-secondary btn-sm">
                Manage Users <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
