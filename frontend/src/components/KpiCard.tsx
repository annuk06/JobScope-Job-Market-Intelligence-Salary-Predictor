import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'gray';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeType = 'cyan'
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrapper">
          <Icon size={18} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {subtext && <span className="kpi-subtext">{subtext}</span>}
        {badge && <span className={`badge badge-${badgeType}`}>{badge}</span>}
      </div>
    </div>
  );
};

export default KpiCard;
