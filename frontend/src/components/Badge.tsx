import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'cyan',
  size = 'md'
}) => {
  return (
    <span 
      className={`badge badge-${variant}`}
      style={{
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
        fontSize: size === 'sm' ? '0.68rem' : '0.75rem'
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
