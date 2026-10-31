import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Search, 
  GitMerge, 
  IndianRupee, 
  AlertCircle, 
  Info,
  Check,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

import api from '../services/api';
import { SkillDemandItem, SkillCooccurrenceItem, RoleMetric } from '../types';
import Badge from '../components/Badge';

export const SkillDemandPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillDemandItem[]>([]);
  const [cooccurrences, setCooccurrences] = useState<SkillCooccurrenceItem[]>([]);
  const [roles, setRoles] = useState<RoleMetric[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Multi-skill comparison selection (default: Python, React, Java, AWS, Docker)
  const [comparisonSkills, setComparisonSkills] = useState<string[]>([
    'Python', 'React', 'Java', 'AWS', 'Docker', 'SQL'
  ]);
  
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsData, coocData, rolesData] = await Promise.all([
        api.getSkills({ limit: 40, role: selectedRole || undefined }),
        api.getSkillCooccurrences({ limit: 20, role: selectedRole || undefined }),
        api.getRoles()
      ]);
      setSkills(skillsData);
      setCooccurrences(coocData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Error loading skill demand data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRole]);

  // Filter skills by search query
  const filteredSkills = skills.filter(s => 
    s.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle skill in comparison
  const toggleComparisonSkill = (skillName: string) => {
    if (comparisonSkills.includes(skillName)) {
      if (comparisonSkills.length > 2) {
        setComparisonSkills(comparisonSkills.filter(s => s !== skillName));
      }
    } else {
      if (comparisonSkills.length < 8) {
        setComparisonSkills([...comparisonSkills, skillName]);
      }
    }
  };

  const comparisonData = skills
    .filter(s => comparisonSkills.includes(s.skill))
    .map(s => ({
      skill: s.skill,
      percentage: s.percentage_of_postings,
      count: s.count,
      avg_lpa: s.avg_salary_inr ? Number((s.avg_salary_inr / 100000).toFixed(1)) : 0
    }));

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Skill Demand & Co-occurrence Analyzer
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Analyze canonical technical capabilities, multi-skill market comparisons, and stack co-occurrences.
        </p>
      </div>

      {/* Role Selector & Search */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="filter-label">Target Role Filter</label>
          <select 
            className="select-input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles Combined</option>
            {roles.map(r => (
              <option key={r.role} value={r.role}>{r.role}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="filter-label">Search Skills</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="text-input" 
              placeholder="e.g. TypeScript, Docker, PyTorch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Interactive Multi-Skill Comparison Section */}
      <div className="glass-card" style={{ marginBottom: '1.75rem' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#38bdf8" />
              <span>Interactive Skill Comparison</span>
            </h3>
            <p className="chart-subtitle">Compare market penetration (%) and average compensation (LPA) side-by-side</p>
          </div>
        </div>

        {/* Selected skills tag bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center', marginRight: '0.4rem' }}>
            Comparing ({comparisonSkills.length}/8):
          </span>
          {comparisonSkills.map(s => (
            <span 
              key={s} 
              onClick={() => toggleComparisonSkill(s)}
              style={{ cursor: 'pointer' }}
            >
              <Badge variant="cyan">
                <span>{s}</span>
                <span style={{ marginLeft: 4, opacity: 0.6 }}>&times;</span>
              </Badge>
            </span>
          ))}
        </div>

        {/* Quick toggle chips from top skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center', marginRight: '0.4rem' }}>
            Click to add/remove:
          </span>
          {skills.slice(0, 15).map(s => {
            const isSelected = comparisonSkills.includes(s.skill);
            return (
              <button
                key={s.skill}
                onClick={() => toggleComparisonSkill(s.skill)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {isSelected && <Check size={12} />}
                <span>{s.skill}</span>
              </button>
            );
          })}
        </div>

        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="skill" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="#38bdf8" unit="%" fontSize={12} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#34d399" unit="L" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                formatter={(val: any, name: any) => [
                  name === 'Market Demand (%)' ? `${val}%` : `₹ ${val} LPA`,
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '0.82rem', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="percentage" name="Market Demand (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avg_lpa" name="Avg Salary (LPA)" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Full Skill Rankings & Skill Co-occurrences */}
      <div className="charts-grid-2">
        {/* Full Ranked Skill Table */}
        <div className="glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Market Demand Frequency Ranking</h3>
              <p className="chart-subtitle">Calculated against total postings in active filter</p>
            </div>
            <Badge variant="gray">{filteredSkills.length} Skills</Badge>
          </div>

          <div className="table-responsive" style={{ maxHeight: 440, overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Technical Skill</th>
                  <th>Postings</th>
                  <th>Market Share</th>
                  <th>Avg Salary (LPA)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((s, idx) => (
                  <tr key={s.skill}>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{s.skill}</td>
                    <td>{s.count.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${s.percentage_of_postings}%`, height: '100%', background: '#38bdf8' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', minWidth: 38 }}>{s.percentage_of_postings}%</span>
                      </div>
                    </td>
                    <td>
                      {s.avg_salary_inr ? (
                        <span style={{ color: '#34d399', fontWeight: 600 }}>
                          ₹ {(s.avg_salary_inr / 100000).toFixed(1)} LPA
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Limited Sample</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skill Co-occurrences Pairs Table */}
        <div className="glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitMerge size={20} color="#a855f7" />
                <span>Skill Co-occurrence Combinations</span>
              </h3>
              <p className="chart-subtitle">Pairs of skills most frequently demanded together in job specs</p>
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: 440, overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Skill Pair (A + B)</th>
                  <th>Joint Mentions</th>
                  <th>Synergy Strength</th>
                </tr>
              </thead>
              <tbody>
                {cooccurrences.map((pair, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Badge variant="cyan">{pair.skill_a}</Badge>
                        <span style={{ color: '#64748b' }}>+</span>
                        <Badge variant="purple">{pair.skill_b}</Badge>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{pair.cooccurrence_count} postings</td>
                    <td>
                      <span className="badge badge-emerald">
                        High Affinity
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Disclaimers & Methodology */}
      <div className="glass-card" style={{ marginTop: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <Info size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <strong style={{ color: '#e2e8f0' }}>Methodological Integrity Notice:</strong> Skill percentages are calculated from unique postings mentioning canonical skills. High frequency indicates prevalent employer demand across vacancies, but does not guarantee superior compensation. Always evaluate skill synergy and role-specific specialization.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDemandPage;
