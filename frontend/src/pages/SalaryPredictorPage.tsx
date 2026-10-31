import React, { useEffect, useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Sliders,
  Plus,
  X
} from 'lucide-react';
import api from '../services/api';
import { 
  SalaryPredictionRequest, 
  SalaryPredictionResult, 
  ModelMetadataResponse 
} from '../types';
import Badge from '../components/Badge';

export const SalaryPredictorPage: React.FC = () => {
  const [modelMeta, setModelMeta] = useState<ModelMetadataResponse | null>(null);
  
  // Profile form state
  const [role, setRole] = useState<string>('Frontend Developer');
  const [experienceYears, setExperienceYears] = useState<number>(4.0);
  const [location, setLocation] = useState<string>('Bengaluru');
  const [employmentType, setEmploymentType] = useState<string>('Full-time');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'React', 'TypeScript', 'JavaScript', 'Tailwind CSS'
  ]);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<SalaryPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModelMetrics()
      .then(meta => {
        setModelMeta(meta);
        if (meta.available_roles && meta.available_roles.length > 0) {
          if (!meta.available_roles.includes(role)) {
            setRole(meta.available_roles[0]);
          }
        }
      })
      .catch(err => console.error("Error loading model metrics", err));
  }, []);

  // Quick skills recommended for active role
  const quickSkillsMap: Record<string, string[]> = {
    'Frontend Developer': ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Tailwind CSS', 'Redux'],
    'Backend Developer': ['Python', 'FastAPI', 'Django', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Redis'],
    'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Docker'],
    'Data Scientist': ['Python', 'SQL', 'Pandas', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'Matplotlib'],
    'Machine Learning Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Docker', 'Kubernetes', 'FastAPI', 'AWS'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Jenkins'],
    'Cloud Engineer': ['AWS', 'Azure', 'Google Cloud', 'Terraform', 'Docker', 'Kubernetes', 'Linux'],
    'Data Engineer': ['SQL', 'Python', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Hadoop', 'AWS'],
    'Mobile Developer': ['React Native', 'Flutter', 'TypeScript', 'iOS', 'Android', 'REST APIs'],
    'QA / Automation Engineer': ['Python', 'Selenium', 'CI/CD', 'Docker', 'REST APIs', 'Linux']
  };

  const recommendedSkills = quickSkillsMap[role] || ['Python', 'SQL', 'Docker', 'Git', 'AWS'];

  const addSkill = (skill: string) => {
    const cleaned = skill.trim();
    if (cleaned && !selectedSkills.includes(cleaned)) {
      setSelectedSkills([...selectedSkills, cleaned]);
    }
    setCustomSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload: SalaryPredictionRequest = {
        role,
        experience_years: Number(experienceYears),
        location,
        skills: selectedSkills,
        employment_type: employmentType
      };
      const result = await api.predictSalary(payload);
      setPrediction(result);
    } catch (err: any) {
      console.error("Prediction error", err);
      setError("Prediction failed. Please ensure the backend server and model are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Machine Learning Salary Predictor
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Real-time compensation inference trained on empirical tech market data with statistical error bounds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        {/* Input Profile Form */}
        <div className="glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="#38bdf8" />
                <span>Candidate Profile Parameters</span>
              </h3>
              <p className="chart-subtitle">Input your target role, experience, location, and technical skill set</p>
            </div>
          </div>

          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target Role */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Target Role</label>
              <select 
                className="select-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                {modelMeta?.available_roles?.map(r => (
                  <option key={r} value={r}>{r}</option>
                )) || (
                  <>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Cloud Engineer">Cloud Engineer</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="QA / Automation Engineer">QA / Automation Engineer</option>
                  </>
                )}
              </select>
            </div>

            {/* Experience Slider & Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="filter-label">Years of Relevant Experience</label>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                  {experienceYears} {experienceYears === 1 ? 'Year' : 'Years'}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                <span>Entry (0 yrs)</span>
                <span>Mid (3-5 yrs)</span>
                <span>Senior (6-8 yrs)</span>
                <span>Principal (10+ yrs)</span>
              </div>
            </div>

            {/* Location & Employment Type Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="filter-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Location</label>
                <select 
                  className="select-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="filter-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Employment Type</label>
                <select 
                  className="select-input"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Technical Skills Selection */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                Technical Skills ({selectedSkills.length})
              </label>
              
              {/* Active skill tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: 40, padding: '0.6rem', background: '#0e1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: '0.6rem' }}>
                {selectedSkills.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>No skills added. Click recommended skills below.</span>
                ) : (
                  selectedSkills.map(s => (
                    <span 
                      key={s} 
                      onClick={() => removeSkill(s)} 
                      style={{ cursor: 'pointer' }}
                      title="Click to remove"
                    >
                      <Badge variant="cyan">
                        <span>{s}</span>
                        <X size={12} style={{ marginLeft: 3 }} />
                      </Badge>
                    </span>
                  ))
                )}
              </div>

              {/* Quick suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', marginRight: '0.2rem' }}>
                  Quick add:
                </span>
                {recommendedSkills.map(rs => (
                  <button
                    type="button"
                    key={rs}
                    onClick={() => addSkill(rs)}
                    disabled={selectedSkills.includes(rs)}
                    style={{
                      background: selectedSkills.includes(rs) ? 'transparent' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: selectedSkills.includes(rs) ? '#475569' : '#94a3b8',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      cursor: selectedSkills.includes(rs) ? 'default' : 'pointer'
                    }}
                  >
                    + {rs}
                  </button>
                ))}
              </div>

              {/* Custom skill input */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="text-input"
                  placeholder="Type any custom tech skill..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(customSkillInput);
                    }
                  }}
                  style={{ fontSize: '0.82rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => addSkill(customSkillInput)}
                  className="btn btn-secondary"
                  style={{ padding: '0 0.8rem', fontSize: '0.8rem' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>Executing Trained Model...</span>
                </>
              ) : (
                <>
                  <Calculator size={18} />
                  <span>Predict Market Compensation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & Model Evaluation Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <AlertTriangle color="#fb7185" size={20} />
              <span style={{ color: '#fecdd3', fontSize: '0.88rem' }}>{error}</span>
            </div>
          )}

          {prediction ? (
            <div className="glass-card animate-fade-in" style={{ border: '1px solid rgba(56, 189, 248, 0.4)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="kpi-title">Model Estimation Result</span>
                <span className="badge badge-emerald">
                  <ShieldCheck size={14} />
                  <span>Statistical Estimate</span>
                </span>
              </div>

              {/* Main Salary Numbers */}
              <div style={{ textAlign: 'center', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Predicted Annual Compensation
                </div>
                <div style={{ fontSize: '3.2rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.02em', margin: '0.3rem 0' }}>
                  {prediction.predicted_salary_lpa}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                  ≈ ₹ {prediction.predicted_annual_salary.toLocaleString()} / year
                </div>
              </div>

              {/* Estimated Range */}
              <div style={{ padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Statistically Justified Range:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                    {prediction.estimated_range_lpa}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Computed as Predicted Salary ± 1.25 &times; Test MAE (₹ {(prediction.model_mae / 100000).toFixed(2)} Lakhs)
                </div>
              </div>

              {/* Model Performance Snapshot */}
              <div style={{ padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.75rem' }}>
                  Model Performance Snapshot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Algorithm</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>{prediction.model_used}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Test MAE</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>₹ {(prediction.model_mae / 100000).toFixed(1)}L</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Test R²</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: 2 }}>{prediction.model_r2.toFixed(3)}</div>
                  </div>
                </div>
              </div>

              {/* Limitations Notice */}
              <div style={{ paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Info size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    {prediction.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Calculator size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Awaiting Profile Submission</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: 360, lineHeight: 1.5 }}>
                Configure your target role, years of experience, and technical skill set on the left to invoke our trained Scikit-Learn regression pipeline.
              </p>
            </div>
          )}

          {/* Model Architecture Transparency */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#34d399" />
              <span>Statistical Validation & Methodology</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <div>
                &bull; <strong>Categorical & Skill Encoding:</strong> Custom MultiHotSkillsEncoder ensures cross-discipline technologies impact salary projections without feature leakage.
              </div>
              <div>
                &bull; <strong>Cross Validation:</strong> 5-fold cross-validation performed on training data splits; baseline linear regression compared against ensemble methods.
              </div>
              <div>
                &bull; <strong>Clean Target:</strong> Only listings with verified currency and annualized amounts were utilized in training (zero imputation avoidance).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryPredictorPage;
