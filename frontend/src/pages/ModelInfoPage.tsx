import React, { useEffect, useState } from 'react';
import { 
  Info, 
  Database, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Table,
  Check
} from 'lucide-react';
import api from '../services/api';
import { ModelMetadataResponse, DatasetMetadataResponse } from '../types';
import Badge from '../components/Badge';

export const ModelInfoPage: React.FC = () => {
  const [modelMeta, setModelMeta] = useState<ModelMetadataResponse | null>(null);
  const [datasetMeta, setDatasetMeta] = useState<DatasetMetadataResponse | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mMeta, dMeta] = await Promise.all([
        api.getModelMetrics(),
        api.getDatasetMetadata()
      ]);
      setModelMeta(mMeta);
      setDatasetMeta(dMeta);
    } catch (err) {
      console.error("Error loading metadata", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncPipeline = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res = await api.triggerDatasetSync();
      setSyncMessage(res.message || "Pipeline re-synchronized and models retrained successfully.");
      await fetchData();
    } catch (err: any) {
      setSyncMessage("Failed to execute pipeline sync. Check backend server logs.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            Dataset Audit & Model Architecture
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Comprehensive documentation of data-cleaning transformations, evaluation metrics, and model limitations.
          </p>
        </div>

        <button 
          onClick={handleSyncPipeline}
          disabled={syncing}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={syncing ? 'spinner' : ''} />
          <span>{syncing ? 'Running Pipeline...' : 'Re-run Data Cleaning & Retrain'}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="glass-card" style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.08)', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <CheckCircle2 color="#34d399" size={20} />
          <span style={{ color: '#a7f3d0', fontSize: '0.88rem' }}>{syncMessage}</span>
        </div>
      )}

      {/* Grid: Dataset Quality Report & Summary */}
      <div className="charts-grid-2">
        {/* Data Quality Report Card */}
        <div className="glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#38bdf8" />
                <span>Data Quality & Cleaning Report</span>
              </h3>
              <p className="chart-subtitle">Audit trail of deduplication, normalization, and outlier removal</p>
            </div>
          </div>

          {datasetMeta?.quality_report ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Raw Records</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                    {datasetMeta.quality_report.total_raw_records?.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Clean Records Retained</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>
                    {datasetMeta.quality_report.clean_records_retained?.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Duplicates Dropped</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fb7185' }}>
                    {datasetMeta.quality_report.duplicate_records_removed}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Valid Annualized Salaries</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                    {datasetMeta.quality_report.records_with_valid_annual_salary?.toLocaleString()} ({datasetMeta.quality_report.valid_salary_percentage}%)
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, paddingTop: '0.5rem' }}>
                <div>&bull; <strong>Undisclosed Salaries:</strong> {datasetMeta.quality_report.records_missing_salary} records clearly preserved without zero-imputation.</div>
                <div>&bull; <strong>Unknown/Unverified Currencies:</strong> {datasetMeta.quality_report.unknown_or_missing_currency} records rejected from salary calculations to avoid false assumptions.</div>
                <div>&bull; <strong>Normalized Roles:</strong> {datasetMeta.quality_report.unique_roles_count} canonical technical disciplines.</div>
                <div>&bull; <strong>Unique Skills Extracted:</strong> {datasetMeta.quality_report.unique_skills_count} canonical technologies.</div>
              </div>
            </div>
          ) : (
            <div className="state-container"><p>Loading quality report...</p></div>
          )}
        </div>

        {/* Dataset Metadata & License */}
        <div className="glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#10b981" />
                <span>Dataset Origin & Licensing</span>
              </h3>
              <p className="chart-subtitle">Source documentation and benchmark governance</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dataset Name</div>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: 2 }}>
                {datasetMeta?.dataset_metadata?.dataset_name || 'JobScope Curated Tech Market Dataset'}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source & License</div>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: 2 }}>
                {datasetMeta?.dataset_metadata?.source || 'Aggregated Industry Benchmark Data'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                {datasetMeta?.dataset_metadata?.license || 'Open Data Commons / CC BY 4.0 for Portfolio Analytics'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(56, 189, 248, 0.06)', borderRadius: 8, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ fontSize: '0.82rem', color: '#bae6fd', lineHeight: 1.5 }}>
                {datasetMeta?.dataset_metadata?.data_notice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark & Comparison Table */}
      <div className="glass-card" style={{ marginBottom: '1.75rem' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={20} color="#a855f7" />
              <span>Machine Learning Algorithm Benchmark Comparison</span>
            </h3>
            <p className="chart-subtitle">
              Trained on 80/20 train/test split with 5-fold cross-validation. Selected model based on lowest test MAE.
            </p>
          </div>
          {modelMeta && (
            <Badge variant="emerald">Champion: {modelMeta.selected_model}</Badge>
          )}
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Status</th>
                <th>Test MAE (Error)</th>
                <th>Test RMSE</th>
                <th>Test R² (Fit)</th>
                <th>5-Fold CV R² Mean</th>
              </tr>
            </thead>
            <tbody>
              {modelMeta?.model_comparison.map(m => {
                const isChampion = m.model_name === modelMeta.selected_model;
                return (
                  <tr key={m.model_name} style={{ background: isChampion ? 'rgba(16, 185, 129, 0.05)' : undefined }}>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{m.model_name}</span>
                        {isChampion && <Badge variant="emerald" size="sm">Champion</Badge>}
                      </div>
                    </td>
                    <td>
                      <Badge variant={isChampion ? 'emerald' : 'gray'}>
                        {isChampion ? 'Production Deployed' : 'Evaluated Baseline'}
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                      ₹ {(m.test_mae / 100000).toFixed(2)} Lakhs (₹ {m.test_mae.toLocaleString()})
                    </td>
                    <td>₹ {(m.test_rmse / 100000).toFixed(2)} Lakhs</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      {m.test_r2.toFixed(4)}
                    </td>
                    <td>{m.cv_r2_mean.toFixed(4)} (&plusmn;{m.cv_r2_std.toFixed(3)})</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Engineering & Limitations */}
      <div className="charts-grid-2">
        {/* Feature Pipelines */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Feature Pipeline Architecture
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <div>
              <strong style={{ color: '#e2e8f0' }}>Categorical Encoding:</strong> OneHotEncoder applied to <code>normalized_title</code>, <code>normalized_location</code>, and <code>employment_type</code> with <code>handle_unknown='ignore'</code>.
            </div>
            <div>
              <strong style={{ color: '#e2e8f0' }}>Skill Multi-Hot Encoding:</strong> Custom <code>MultiHotSkillsEncoder</code> fitted exclusively on training split; maps list of skills into a binary vector across canonical skill vocabulary.
            </div>
            <div>
              <strong style={{ color: '#e2e8f0' }}>Numeric Standardization:</strong> <code>StandardScaler</code> fitted on <code>experience_years</code> to ensure stable gradient step sizes.
            </div>
            <div>
              <strong style={{ color: '#e2e8f0' }}>Target Variable:</strong> <code>annual_salary_avg</code> in Indian Rupees (INR).
            </div>
          </div>
        </div>

        {/* Documented Limitations */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span>Documented Limitations & Assumptions</span>
          </h4>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {modelMeta?.known_limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            )) || (
              <>
                <li>Estimates reflect advertised base compensation and do not factor in private negotiations or stock grants.</li>
                <li>Predictions are statistical approximations based on observed role, experience, and skill combinations.</li>
              </>
            )}
            <li>Advertised salaries may vary from final negotiated compensation packages.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoPage;
