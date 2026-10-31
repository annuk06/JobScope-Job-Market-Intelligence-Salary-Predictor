import React from 'react';
import { ShieldCheck, Database, GitBranch } from 'lucide-react';

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
    <header className="topbar">
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-actions">
        <div className="badge badge-cyan" title="Validated against empirical dataset distributions">
          <ShieldCheck size={14} />
          <span>Verified Data Engine</span>
        </div>
        <div className="badge badge-emerald" title="SQLite / PostgreSQL compliant">
          <Database size={14} />
          <span>Active Relational DB</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
