import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Layers, 
  MapPin, 
  Cpu, 
  IndianRupee, 
  Percent, 
  AlertCircle,
  TrendingUp,
  Globe
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';

import api from '../services/api';
import { 
  DashboardSummary, 
  RoleMetric, 
  LocationMetric, 
  SalaryAnalytics,
  FilterParams 
} from '../types';
import KpiCard from '../components/KpiCard';
import FilterBar from '../components/FilterBar';

const CHART_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#c084fc', '#fb7185', '#38ef7d'];

export const OverviewPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [roles, setRoles] = useState<RoleMetric[]>([]);
  const [locations, setLocations] = useState<LocationMetric[]>([]);
  const [salaries, setSalaries] = useState<SalaryAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, rolesData, locsData, salData] = await Promise.all([
        api.getDashboardSummary(filters),
        api.getRoles(filters),
        api.getLocations(filters),
        api.getSalaries(filters)
      ]);
      setSummary(sumData);
      setRoles(rolesData);
      setLocations(locsData);
      setSalaries(salData);
    } catch (err: any) {
      console.error("Dashboard data load error", err);
      setError("Failed to load dashboard analytics. Ensure backend server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  // Formatter for LPA Tooltips
  const formatLpa = (val: any) => {
    if (val === null || val === undefined) return 'N/A';
    return `₹ ${(Number(val) / 100000).toFixed(1)} LPA`;
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Executive Analytics Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Empirical IT labor market metrics computed directly from cleaned relational records.
        </p>
      </div>

      {/* Dynamic Filter Bar */}
      <FilterBar 
        filters={filters} 
        onChange={setFilters} 
        availableRoles={roles.map(r => r.role)}
        availableLocations={locations.map(l => l.location)}
      />

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AlertCircle color="#fb7185" size={20} />
          <span style={{ color: '#fecdd3', fontSize: '0.88rem' }}>{error}</span>
        </div>
      )}

      {loading && !summary ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Computing dataset metrics across active dimensions...</p>
        </div>
      ) : summary ? (
        <>
          {/* KPI Grid */}
          <div className="kpi-grid">
            <KpiCard
              title="Total Job Postings"
              value={summary.total_postings.toLocaleString()}
              subtext="Active empirical records"
              icon={Briefcase}
              badge="Database Verified"
              badgeType="cyan"
            />
            <KpiCard
              title="Distinct Tech Roles"
              value={summary.total_roles}
              subtext="Normalized job families"
              icon={Layers}
              badge="Standardized"
              badgeType="purple"
            />
            <KpiCard
              title="Tech Hub Locations"
              value={summary.total_locations}
              subtext="Metro tech hubs + Remote"
              icon={MapPin}
              badge="Geographic"
              badgeType="cyan"
            />
            <KpiCard
              title="Median Advertised Salary"
              value={summary.median_annual_salary ? `₹ ${(summary.median_annual_salary / 100000).toFixed(1)} LPA` : "N/A"}
              subtext={summary.mean_annual_salary ? `Mean: ₹ ${(summary.mean_annual_salary / 100000).toFixed(1)} LPA` : "Valid data only"}
              icon={IndianRupee}
              badge="Annualized INR"
              badgeType="emerald"
            />
            <KpiCard
              title="Salary Disclosure Rate"
              value={`${summary.salary_disclosure_percentage}%`}
              subtext={`${summary.total_valid_salary_records.toLocaleString()} validated salary records`}
              icon={Percent}
              badge={summary.salary_disclosure_percentage > 60 ? "High Transparency" : "Moderate"}
              badgeType="amber"
            />
            <KpiCard
              title="Top Demanded Skill"
              value={summary.top_demanded_skills[0]?.skill || "N/A"}
              subtext={`${summary.top_demanded_skills[0]?.percentage || 0}% of matching postings`}
              icon={Cpu}
              badge="Highest Frequency"
              badgeType="cyan"
            />
          </div>

          {/* Charts Row 1: Roles and Skills */}
          <div className="charts-grid-2">
            {/* Roles Bar Chart */}
            <div className="glass-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Job Postings by Role</h3>
                  <p className="chart-subtitle">Distribution of vacancies across normalized technical families</p>
                </div>
              </div>
              <div style={{ height: 320 }}>
                {roles.length === 0 ? (
                  <div className="state-container"><p>No role postings match current filters.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roles.slice(0, 8)} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis dataKey="role" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={130} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                        formatter={(val: any, name: any, item: any) => [
                          `${val} postings (${item.payload.market_share_percentage}%)`,
                          'Volume'
                        ]}
                      />
                      <Bar dataKey="posting_count" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Demanded Skills Chart */}
            <div className="glass-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Top In-Demand Technical Skills</h3>
                  <p className="chart-subtitle">Percentage of job postings requiring canonical technologies</p>
                </div>
              </div>
              <div style={{ height: 320 }}>
                {summary.top_demanded_skills.length === 0 ? (
                  <div className="state-container"><p>No skill data available for selection.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.top_demanded_skills} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" unit="%" stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                      <YAxis dataKey="skill" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={90} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                        formatter={(val: any, name: any, item: any) => [
                          `${val}% (${item.payload.count} postings)`,
                          'Market Frequency'
                        ]}
                      />
                      <Bar dataKey="percentage" fill="#818cf8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Salary Distribution & Experience Curve */}
          <div className="charts-grid-2">
            {/* Salary Distribution Brackets */}
            <div className="glass-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Advertised Salary Distribution</h3>
                  <p className="chart-subtitle">Frequency across standardized annual compensation brackets (LPA)</p>
                </div>
              </div>
              <div style={{ height: 300 }}>
                {!salaries || salaries.distribution.length === 0 ? (
                  <div className="state-container"><p>No salary disclosure records for current filter.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaries.distribution} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="bracket_label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                        formatter={(val: any, name: any, item: any) => [
                          `${val} jobs (${item.payload.percentage}%)`,
                          'Postings'
                        ]}
                      />
                      <Bar dataKey="job_count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Salary by Experience Level */}
            <div className="glass-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Compensation by Experience Level</h3>
                  <p className="chart-subtitle">Observed mean vs median annual salaries across career tiers</p>
                </div>
              </div>
              <div style={{ height: 300 }}>
                {!salaries || salaries.by_experience.length === 0 ? (
                  <div className="state-container"><p>No experience salary data available.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={salaries.by_experience.map(e => ({
                        ...e,
                        mean_lpa: e.avg_annual_salary ? Number((e.avg_annual_salary / 100000).toFixed(1)) : 0,
                        median_lpa: e.median_annual_salary ? Number((e.median_annual_salary / 100000).toFixed(1)) : 0,
                      }))}
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="experience_level" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis unit="L" stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                        formatter={(val: any) => [`₹ ${val} LPA`]}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                      <Bar dataKey="mean_lpa" name="Mean (LPA)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="median_lpa" name="Median (LPA)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 3: Locations & Remote */}
          <div className="charts-grid-2">
            {/* Location Volume Chart */}
            <div className="glass-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Postings by Tech Location</h3>
                  <p className="chart-subtitle">Market share per canonical geographic hub</p>
                </div>
              </div>
              <div style={{ height: 280 }}>
                {locations.length === 0 ? (
                  <div className="state-container"><p>No location records.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locations} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="location" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                        formatter={(val: any, name: any, item: any) => [
                          `${val} postings (${item.payload.percentage}%)`,
                          'Share'
                        ]}
                      />
                      <Bar dataKey="posting_count" fill="#c084fc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Remote vs Onsite Comparison */}
            <div className="glass-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Remote vs Onsite / Hybrid Opportunities</h3>
                  <p className="chart-subtitle">Comparison of hiring volume and compensation</p>
                </div>
              </div>
              <div style={{ height: 280 }}>
                {!salaries || salaries.remote_comparison.length === 0 ? (
                  <div className="state-container"><p>No work mode data.</p></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '100%', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={salaries.remote_comparison}
                          dataKey="job_count"
                          nameKey="work_mode"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {salaries.remote_comparison.map((_, idx) => (
                            <Cell key={idx} fill={idx === 0 ? '#38bdf8' : '#6366f1'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                          formatter={(val: any, name: any, item: any) => [
                            `${val} jobs (${item.payload.percentage}%)`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {salaries.remote_comparison.map((mode, idx) => (
                        <div key={mode.work_mode} style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: idx === 0 ? '#38bdf8' : '#6366f1' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{mode.work_mode}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Postings: <strong>{mode.job_count}</strong> ({mode.percentage}%)
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.2rem' }}>
                            Avg Salary: <strong>{mode.avg_annual_salary ? `₹ ${(mode.avg_annual_salary / 100000).toFixed(1)} LPA` : 'Undisclosed'}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default OverviewPage;
