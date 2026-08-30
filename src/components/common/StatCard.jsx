import React from 'react';

export const StatCard = ({
  title,
  value,
  icon,
  color = 'var(--primary)',
  bgColor = 'var(--primary-light)',
  subtitle = null,
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon" style={{ backgroundColor: bgColor, color }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-footer">{subtitle}</div>}
    </div>
  );
};
