import React from 'react';
import { Check, Clock, Play, CheckCircle2, XCircle } from 'lucide-react';

export const StatusStepper = ({ status = 'Pending' }) => {
  const isRejected = status === 'Rejected';

  const steps = [
    { key: 'Pending', label: 'Request Created', icon: Clock },
    { key: 'Accepted', label: 'Worker Assigned', icon: Check },
    { key: 'In Progress', label: 'Work In Progress', icon: Play },
    { key: 'Resolved', label: 'Completed & Resolved', icon: CheckCircle2 },
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'Pending': return 0;
      case 'Accepted': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  if (isRejected) {
    return (
      <div
        style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          margin: '1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--danger)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <XCircle size={24} />
        </div>
        <div>
          <h4 style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1rem' }}>
            Request Rejected
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--danger-text)', marginTop: '0.2rem' }}>
            This service request was reviewed and rejected. It cannot be reopened or transitioned.
          </p>
        </div>
      </div>
    );
  }

  const progressPercentage = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="card" style={{ padding: '1.5rem', margin: '1.5rem 0' }}>
      <div className="status-stepper">
        <div className="stepper-line">
          <div
            className="stepper-line-progress"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          let stepClass = 'status-step';
          if (isCompleted) stepClass += ' completed';
          else if (isCurrent) stepClass += ' current';

          return (
            <div key={step.key} className={stepClass}>
              <div className="step-circle">
                {isCompleted ? <Check size={18} /> : <StepIcon size={16} />}
              </div>
              <div className="step-label">
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
