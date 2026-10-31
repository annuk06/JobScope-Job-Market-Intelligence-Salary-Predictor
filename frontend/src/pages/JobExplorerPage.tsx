import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Building,
  MapPin,
  Calendar,
  Briefcase,
  IndianRupee,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { JobListItem, JobDetail, PaginatedJobsResponse } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const JobExplorerPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Search and filters
  const [search, setSearch] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isRemote, setIsRemote] = useState<string>('');
  const [hasSalary, setHasSalary] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('posting_date');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Selected job for modal view
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res: PaginatedJobsResponse = await api.getJobs({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        role: role || undefined,
        location: location || undefined,
        is_remote: isRemote === '' ? undefined : isRemote === 'true',
        has_salary: hasSalary === '' ? undefined : hasSalary === 'true',
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setJobs(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error("Error fetching jobs table", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, pageSize, role, location, isRemote, hasSalary, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleViewDetails = async (jobId: string) => {
    setSelectedJobId(jobId);
    try {
      setModalLoading(true);
      const detail = await api.getJobById(jobId);
      setJobDetail(detail);
    } catch (err) {
      console.error("Error fetching job detail", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRole('');
    setLocation('');
    setIsRemote('');
    setHasSalary('');
    setSortBy('posting_date');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Jobs & Records Data Explorer
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Inspect, filter, search, and audit validated tech job postings stored in the relational database.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input 
              type="text" 
              className="text-input" 
              placeholder="Search job title, company, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            <span>Search</span>
          </button>
          <button type="button" onClick={handleResetFilters} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </form>

        {/* Dropdown Filters Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="filter-label">Role</label>
            <select className="select-input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
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
            </select>
          </div>

          <div>
            <label className="filter-label">Location</label>
            <select className="select-input" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}>
              <option value="">All Locations</option>
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
            <label className="filter-label">Work Mode</label>
            <select className="select-input" value={isRemote} onChange={(e) => { setIsRemote(e.target.value); setPage(1); }}>
              <option value="">All Modes</option>
              <option value="true">Remote Only</option>
              <option value="false">Onsite / Hybrid</option>
            </select>
          </div>

          <div>
            <label className="filter-label">Salary Filter</label>
            <select className="select-input" value={hasSalary} onChange={(e) => { setHasSalary(e.target.value); setPage(1); }}>
              <option value="">All Records</option>
              <option value="true">Disclosed Only</option>
              <option value="false">Undisclosed Only</option>
            </select>
          </div>

          <div>
            <label className="filter-label">Sort Column</label>
            <select className="select-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="posting_date">Posting Date</option>
              <option value="annual_salary_avg">Salary</option>
              <option value="raw_title">Job Title</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div>
            <label className="filter-label">Order</label>
            <select className="select-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Showing <strong>{jobs.length}</strong> of <strong>{total.toLocaleString()}</strong> job records
          </span>
          <span className="badge badge-gray">Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="state-container"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="state-container"><p>No job postings match current search criteria.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Title & Role</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Annual Salary</th>
                  <th>Skills</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      {job.job_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 2 }}>
                        {job.raw_title}
                      </div>
                      <Badge variant="cyan" size="sm">{job.normalized_title}</Badge>
                    </td>
                    <td>{job.company}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{job.normalized_location}</span>
                        {job.is_remote && <Badge variant="emerald" size="sm">Remote</Badge>}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#94a3b8' }}>{job.experience_years} yrs</span>
                    </td>
                    <td>
                      {job.is_valid_salary && job.annual_salary_avg ? (
                        <span style={{ color: '#34d399', fontWeight: 700 }}>
                          ₹ {(job.annual_salary_avg / 100000).toFixed(1)} LPA
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Undisclosed</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: 220 }}>
                        {job.skills.slice(0, 3).map(s => (
                          <Badge key={s} variant="gray" size="sm">{s}</Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center' }}>
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(job.job_id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span>Rows per page:</span>
            <select 
              className="select-input" 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ width: '70px', padding: '0.25rem 0.5rem' }}
            >
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <span style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: '0 0.5rem' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      <Modal
        isOpen={selectedJobId !== null}
        onClose={() => { setSelectedJobId(null); setJobDetail(null); }}
        title={jobDetail ? `${jobDetail.raw_title} (${jobDetail.job_id})` : "Job Record Details"}
      >
        {modalLoading ? (
          <div className="state-container"><div className="spinner" /></div>
        ) : jobDetail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header snippet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{jobDetail.company}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                  <Badge variant="cyan">{jobDetail.normalized_title}</Badge>
                  <span style={{ color: '#64748b' }}>&bull;</span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{jobDetail.normalized_location}</span>
                  {jobDetail.is_remote && <Badge variant="emerald" size="sm">Remote</Badge>}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-gray">{jobDetail.employment_type}</span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                  Posted: {jobDetail.posting_date || 'N/A'}
                </div>
              </div>
            </div>

            {/* Compensation Details */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                Compensation & Standardization Audit
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Standardized Annual Salary:</span>
                  <div style={{ fontWeight: 700, color: jobDetail.is_valid_salary ? '#34d399' : '#64748b', fontSize: '1rem' }}>
                    {jobDetail.annual_salary_avg ? `₹ ${(jobDetail.annual_salary_avg / 100000).toFixed(2)} LPA` : 'Undisclosed / Missing'}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Raw Disclosed Salary:</span>
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                    {jobDetail.raw_salary_min ? `${jobDetail.raw_salary_min.toLocaleString()} - ${jobDetail.raw_salary_max?.toLocaleString()} ${jobDetail.raw_currency || ''} (${jobDetail.raw_period || 'yr'})` : 'None Disclosed'}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Validation Status:</span>
                  <div style={{ marginTop: 2 }}>
                    {jobDetail.is_valid_salary ? (
                      <Badge variant="emerald">Valid Annualized</Badge>
                    ) : (
                      <Badge variant="amber">Undisclosed / Filtered</Badge>
                    )}
                  </div>
                </div>
              </div>

              {jobDetail.salary_quality_note && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  Pipeline Note: <em>{jobDetail.salary_quality_note}</em>
                </div>
              )}
            </div>

            {/* Experience & Seniority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Experience Requirement:</span>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                  {jobDetail.experience_years} Years ({jobDetail.experience_level})
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Feed Source:</span>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{jobDetail.source}</div>
              </div>
            </div>

            {/* Required Technical Skills */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                Extracted Canonical Skills ({jobDetail.skills.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {jobDetail.skills.map(s => (
                  <Badge key={s} variant="cyan">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default JobExplorerPage;
