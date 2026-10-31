import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  ListCheck, 
  Info,
  Plus,
  X,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { SkillGapRequest, SkillGapResponse } from '../types';
import Badge from '../components/Badge';

export const SkillGapPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [userSkills, setUserSkills] = useState<string[]>(['JavaScript', 'React', 'HTML/CSS']);
  const [skillInput, setSkillInput] = useState<string>('');
  
  // Interactive checklist completed skills state during current session
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SkillGapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Data Engineer',
    'Mobile Developer',
    'QA / Automation Engineer'
  ];

  const addSkill = (skill: string) => {
    const cleaned = skill.trim();
    if (cleaned && !userSkills.includes(cleaned)) {
      setUserSkills([...userSkills, cleaned]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(s => s !== skillToRemove));
  };

  const toggleChecklist = (skill: string) => {
    const next = new Set(completedItems);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setCompletedItems(next);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload: SkillGapRequest = {
        target_role: targetRole,
        user_skills: userSkills
      };
      const data = await api.analyzeSkillGap(payload);
      setResult(data);
      setCompletedItems(new Set()); // Reset session checklist
    } catch (err) {
      console.error("Skill gap analysis error", err);
      setError("Failed to run skill gap analysis. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Empirical Skill Gap Analyzer
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Benchmark your skill set against real requirements observed across actual job vacancies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        {/* Input Card */}
        <div className="glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="#f59e0b" />
                <span>Target Role & Existing Skills</span>
              </h3>
              <p className="chart-subtitle">Specify where you want to go and what technologies you currently know</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target Role */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                Target IT Job Role
              </label>
              <select 
                className="select-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
              >
                {availableRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Current Skills */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                Your Current Technical Skills ({userSkills.length})
              </label>

              {/* Tag box */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: 48, padding: '0.6rem', background: '#0e1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: '0.75rem' }}>
                {userSkills.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>
                    Type your skills below and press Enter or +
                  </span>
                ) : (
                  userSkills.map(s => (
                    <span 
                      key={s} 
                      onClick={() => removeSkill(s)} 
                      style={{ cursor: 'pointer' }}
                      title="Click to remove"
                    >
                      <Badge variant="emerald">
                        <span>{s}</span>
                        <X size={12} style={{ marginLeft: 3 }} />
                      </Badge>
                    </span>
                  ))
                )}
              </div>

              {/* Quick skill add suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', marginRight: '0.2rem' }}>
                  Common starters:
                </span>
                {['JavaScript', 'Python', 'SQL', 'React', 'Node.js', 'Java', 'Git', 'Docker'].map(starter => (
                  <button
                    type="button"
                    key={starter}
                    onClick={() => addSkill(starter)}
                    disabled={userSkills.includes(starter)}
                    style={{
                      background: userSkills.includes(starter) ? 'transparent' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: userSkills.includes(starter) ? '#475569' : '#94a3b8',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      cursor: userSkills.includes(starter) ? 'default' : 'pointer'
                    }}
                  >
                    + {starter}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="text-input"
                  placeholder="e.g. MongoDB, FastAPI, GraphQL..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => addSkill(skillInput)}
                  className="btn btn-secondary"
                  style={{ padding: '0 0.8rem' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || userSkills.length === 0}
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>Analyzing Postings...</span>
                </>
              ) : (
                <>
                  <Compass size={18} />
                  <span>Analyze Skill Gap</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <AlertCircle color="#fb7185" size={20} />
              <span style={{ color: '#fecdd3', fontSize: '0.88rem' }}>{error}</span>
            </div>
          )}

          {result ? (
            <div className="glass-card animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Analysis for {result.target_role}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Evaluated against <strong>{result.total_role_postings_evaluated}</strong> active job postings in dataset
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: result.match_percentage >= 60 ? '#34d399' : '#f59e0b' }}>
                    {result.match_percentage}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Core Match Score</div>
                </div>
              </div>

              {/* Matched Skills */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Matched Skills in Target Role ({result.matched_skills.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {result.matched_skills.length > 0 ? (
                    result.matched_skills.map(s => (
                      <Badge key={s} variant="emerald">{s}</Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No direct overlap with top skills for this role yet.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills Identified from Real Postings */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.6rem' }}>
                  Identified Skill Gaps by Employer Frequency
                </div>

                <div className="table-responsive" style={{ maxHeight: 280, overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Missing Skill</th>
                        <th>Frequency in Postings</th>
                        <th>Importance Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.missing_skills.slice(0, 10).map(m => (
                        <tr key={m.skill}>
                          <td style={{ fontWeight: 600, color: '#f8fafc' }}>{m.skill}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${m.frequency_percentage}%`, height: '100%', background: m.frequency_percentage >= 50 ? '#f59e0b' : '#38bdf8' }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', minWidth: 50 }}>
                                {m.frequency_percentage}% ({m.frequency_count})
                              </span>
                            </div>
                          </td>
                          <td>
                            <Badge variant={m.importance_tier.includes('Essential') ? 'amber' : (m.importance_tier.includes('Recommended') ? 'cyan' : 'gray')}>
                              {m.importance_tier}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evidence-Based Interactive Learning Checklist */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ListCheck size={18} color="#38bdf8" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                    Evidence-Based Development Checklist ({completedItems.size}/{result.missing_skills.slice(0, 5).length} Mastered)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.missing_skills.slice(0, 5).map(item => {
                    const isDone = completedItems.has(item.skill);
                    return (
                      <label 
                        key={item.skill} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.6rem', 
                          cursor: 'pointer',
                          padding: '0.5rem 0.6rem',
                          borderRadius: 6,
                          background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          checked={isDone}
                          onChange={() => toggleChecklist(item.skill)}
                        />
                        <span style={{ 
                          fontSize: '0.85rem', 
                          color: isDone ? '#34d399' : '#f8fafc',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}>
                          Learn <strong>{item.skill}</strong> (Demanded in {item.frequency_percentage}% of {result.target_role} vacancies)
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.85rem', borderRadius: 8 }}>
                <Info size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.5 }}>
                  {result.disclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Compass size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ready to Discover Skill Gaps</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: 360, lineHeight: 1.5 }}>
                Select your target role and list your current capabilities on the left to receive an evidence-based gap analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
