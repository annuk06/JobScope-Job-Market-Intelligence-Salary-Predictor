import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Cpu, 
  Calculator, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { DashboardSummary } from '../types';

export const LandingPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api.getDashboardSummary()
      .then(data => setSummary(data))
      .catch(err => console.error("Could not fetch landing stats", err));
  }, []);

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1rem 2.5rem 1rem', maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Sparkles size={16} />
          <span>PORTFOLIO PLATFORM &bull; REAL DATA & ML PIPELINES</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
          Empirical IT Market Intelligence &{' '}
          <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Machine Learning Salary Predictor
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.25rem' }}>
          JobScope bridges the gap between students, professionals, and the modern tech hiring landscape. 
          Powered by real data-cleaning pipelines, SQL analytics engines, and scikit-learn regression models.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/overview" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}>
            <span>Launch Analytics Dashboard</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/predictor" className="btn btn-secondary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}>
            <Calculator size={18} />
            <span>Try ML Salary Predictor</span>
          </Link>
        </div>
      </div>

      {/* Live Benchmark Stats Strip */}
      {summary && (
        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto 3.5rem auto', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Tracked Tech Postings</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                {summary.total_postings.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Distinct Roles</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                {summary.total_roles}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Median Advertised Salary</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                ₹ {(summary.median_annual_salary! / 100000).toFixed(1)} LPA
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Salary Disclosure Rate</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#a855f7', marginTop: '0.2rem' }}>
                {summary.salary_disclosure_percentage}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Architectural Pillars */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>
          Production-Grade Intelligence Modules
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
          Built with an enterprise architecture: FastAPI, SQLAlchemy, Scikit-learn, and React.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Executive Overview Dashboard</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Dynamic KPI cards and cross-filtering across roles, locations, seniority bands, and remote policies.
            </p>
            <Link to="/overview" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>View Dashboard</span> &rarr;
            </Link>
          </div>

          <div className="glass-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '1.25rem' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Skill Demand & Co-occurrence</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Empirical skill ranking, multi-skill comparison, and SQL self-join co-occurrence matrix discovering synergistic tech stacks.
            </p>
            <Link to="/skills" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Analyze Skills</span> &rarr;
            </Link>
          </div>

          <div className="glass-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.25rem' }}>
              <Calculator size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Trained ML Salary Predictor</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Regression model trained with cross-validation and feature pipelines (OneHot, MultiHot skills, Scaler) delivering statistically justified ranges.
            </p>
            <Link to="/predictor" style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Estimate Compensation</span> &rarr;
            </Link>
          </div>

          <div className="glass-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.25rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Empirical Skill Gap Analyzer</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Compare current candidate capabilities against live database requirements for target roles, generating evidence-based checklists.
            </p>
            <Link to="/skill-gap" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Discover Gaps</span> &rarr;
            </Link>
          </div>

          <div className="glass-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '1.25rem' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Temporal Hiring Trends</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Monthly job posting frequencies and compensation trajectories across the observed period.
            </p>
            <Link to="/trends" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Explore Trends</span> &rarr;
            </Link>
          </div>

          <div className="glass-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185', marginBottom: '1.25rem' }}>
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data Explorer & Quality Audit</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Searchable, paginated repository of clean job listings with full transparency into deduplication, currency standardization, and outlier flags.
            </p>
            <Link to="/explorer" style={{ color: '#fb7185', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Search Records</span> &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Portfolio & Rigor Highlights */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={22} color="#38bdf8" />
          <span>Core Engineering & Methodological Standards</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', color: '#94a3b8', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong>No Fabricated Data:</strong> Distinguishes actual dataset statistics from model-generated estimates.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong>Defensive Currency Handling:</strong> Never silently converts unknown currencies as INR or USD.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong>No Data Leakage:</strong> ML preprocessors fitted strictly on training splits; missing salaries preserved distinctly.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong>SQL Normalization:</strong> Many-to-many `job_skills` association table prevents distorted double-counting.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
