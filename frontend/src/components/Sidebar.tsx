import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Cpu, 
  Calculator, 
  Compass, 
  TrendingUp, 
  Database, 
  Info,
  Sparkles,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Sparkles },
    { to: '/overview', label: 'Executive Overview', icon: BarChart3 },
    { to: '/skills', label: 'Skill Demand Analyzer', icon: Cpu },
    { to: '/predictor', label: 'Salary Predictor (ML)', icon: Calculator },
    { to: '/skill-gap', label: 'Skill Gap Analyzer', icon: Compass },
    { to: '/trends', label: 'Hiring Trends', icon: TrendingUp },
    { to: '/explorer', label: 'Jobs Explorer', icon: Database },
    { to: '/dataset-model', label: 'Dataset & ML Info', icon: Info },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo-icon">
          <Layers size={20} color="#ffffff" />
        </div>
        <div className="brand-text">
          <h1>JobScope</h1>
          <p>Market Intelligence</p>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>API & ML Online</span>
        </div>
        <p>Curated Benchmark v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
