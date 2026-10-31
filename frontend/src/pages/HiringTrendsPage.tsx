import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  IndianRupee, 
  AlertCircle,
  Info 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

import api from '../services/api';
import { TrendItem, RoleMetric } from '../types';

export const HiringTrendsPage: React.FC = () => {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [roles, setRoles] = useState<RoleMetric[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const [trendData, rolesData] = await Promise.all([
        api.getTrends({ role: selectedRole || undefined }),
        api.getRoles()
      ]);
      setTrends(trendData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Error loading trends", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [selectedRole]);

  const formattedTrendData = trends.map(t => ({
    ...t,
    avg_lpa: t.avg_salary ? Number((t.avg_salary / 100000).toFixed(1)) : 0
  }));

  const totalObservedPostings = trends.reduce((acc, curr) => acc + curr.postings, 0);

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Temporal Hiring & Compensation Trends
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Track monthly vacancy volumes and compensation progression across the dataset's observation period.
        </p>
      </div>

      {/* Role Filter & Timeline Overview */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 260 }}>
          <label className="filter-label">Filter Trend by Role</label>
          <select 
            className="select-input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Tech Roles Combined</option>
            {roles.map(r => (
              <option key={r.role} value={r.role}>{r.role}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Months Tracked</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8' }}>{trends.length} Months</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Postings in Period</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399' }}>{totalObservedPostings.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart 1: Monthly Hiring Postings Volume */}
      <div className="glass-card" style={{ marginBottom: '1.75rem' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#38bdf8" />
              <span>Monthly Job Posting Volume</span>
            </h3>
            <p className="chart-subtitle">Aggregate monthly active postings recorded in dataset</p>
          </div>
        </div>

        <div style={{ height: 320 }}>
          {loading ? (
            <div className="state-container"><div className="spinner" /></div>
          ) : formattedTrendData.length === 0 ? (
            <div className="state-container"><p>No timeline records for this role.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="postingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                  formatter={(val: any) => [`${val} job postings`, 'Volume']}
                />
                <Area type="monotone" dataKey="postings" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#postingGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Monthly Average Salary Trajectory */}
      <div className="glass-card" style={{ marginBottom: '1.75rem' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={20} color="#34d399" />
              <span>Monthly Average Advertised Salary (LPA)</span>
            </h3>
            <p className="chart-subtitle">Calculated strictly from listings with disclosed, valid compensation</p>
          </div>
        </div>

        <div style={{ height: 320 }}>
          {loading ? (
            <div className="state-container"><div className="spinner" /></div>
          ) : formattedTrendData.length === 0 ? (
            <div className="state-container"><p>No compensation timeline records for this role.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis unit="L" stroke="#64748b" fontSize={12} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                  formatter={(val: any) => [`₹ ${val} LPA`, 'Mean Salary']}
                />
                <Area type="monotone" dataKey="avg_lpa" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#salaryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Methodological Guidance */}
      <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <Info size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <strong style={{ color: '#e2e8f0' }}>Forecasting Integrity Standard:</strong> JobScope displays empirical time-series aggregations across observed posting months. In accordance with data integrity guidelines, we do not extrapolate future hiring claims from short historical windows without multi-year seasonal baselines.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringTrendsPage;
