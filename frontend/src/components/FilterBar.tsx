import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { FilterParams } from '../types';

interface FilterBarProps {
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
  availableRoles?: string[];
  availableLocations?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  availableRoles = [],
  availableLocations = []
}) => {
  const defaultRoles = [
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

  const defaultLocations = [
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Delhi NCR',
    'Mumbai',
    'Chennai',
    'Remote'
  ];

  const roles = availableRoles.length ? availableRoles : defaultRoles;
  const locations = availableLocations.length ? availableLocations : defaultLocations;

  const handleFieldChange = (field: keyof FilterParams, value: any) => {
    onChange({
      ...filters,
      [field]: value === '' ? undefined : value
    });
  };

  const handleReset = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
        <Filter size={16} />
        <span>FILTERS</span>
      </div>

      <div className="filter-group">
        <label className="filter-label">Job Role</label>
        <select
          className="select-input"
          value={filters.role || ''}
          onChange={(e) => handleFieldChange('role', e.target.value)}
        >
          <option value="">All Tech Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Location</label>
        <select
          className="select-input"
          value={filters.location || ''}
          onChange={(e) => handleFieldChange('location', e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Seniority</label>
        <select
          className="select-input"
          value={filters.experience_level || ''}
          onChange={(e) => handleFieldChange('experience_level', e.target.value)}
        >
          <option value="">All Experience Levels</option>
          <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
          <option value="Mid Level (3-5 yrs)">Mid Level (3-5 yrs)</option>
          <option value="Senior Level (6-8 yrs)">Senior Level (6-8 yrs)</option>
          <option value="Lead / Principal (8+ yrs)">Lead / Principal (8+ yrs)</option>
        </select>
      </div>

      <div className="filter-group" style={{ maxWidth: '140px' }}>
        <label className="filter-label">Work Mode</label>
        <select
          className="select-input"
          value={filters.is_remote === undefined ? '' : filters.is_remote ? 'true' : 'false'}
          onChange={(e) => handleFieldChange('is_remote', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All Modes</option>
          <option value="true">Remote Only</option>
          <option value="false">Onsite / Hybrid</option>
        </select>
      </div>

      <div className="filter-group" style={{ maxWidth: '160px' }}>
        <label className="filter-label">Salary Disclosed</label>
        <select
          className="select-input"
          value={filters.has_salary === undefined ? '' : filters.has_salary ? 'true' : 'false'}
          onChange={(e) => handleFieldChange('has_salary', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All Postings</option>
          <option value="true">Disclosed Only</option>
          <option value="false">Undisclosed Only</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={handleReset} 
          className="btn btn-secondary"
          style={{ height: '36px', marginTop: '1.1rem', fontSize: '0.8rem', padding: '0 0.75rem' }}
          title="Clear all active filters"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

export default FilterBar;
