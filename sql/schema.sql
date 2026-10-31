-- JobScope Relational Database Schema
-- Compatible with SQLite and PostgreSQL

DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS dataset_metadata;

-- Core Jobs Table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id VARCHAR(50) UNIQUE NOT NULL,
    raw_title VARCHAR(255) NOT NULL,
    normalized_title VARCHAR(100) NOT NULL,
    company VARCHAR(255) NOT NULL,
    raw_location VARCHAR(100),
    normalized_location VARCHAR(100) NOT NULL,
    is_remote BOOLEAN DEFAULT 0,
    experience_years REAL DEFAULT 0.0,
    experience_level VARCHAR(50) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    raw_salary_min REAL,
    raw_salary_max REAL,
    raw_currency VARCHAR(10),
    raw_period VARCHAR(20),
    annual_salary_min REAL,
    annual_salary_max REAL,
    annual_salary_avg REAL,
    is_valid_salary BOOLEAN DEFAULT 0,
    salary_quality_note VARCHAR(255),
    standardized_currency VARCHAR(10) DEFAULT 'INR',
    posting_date DATE,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_normalized_title ON jobs (normalized_title);
CREATE INDEX idx_jobs_normalized_location ON jobs (normalized_location);
CREATE INDEX idx_jobs_is_valid_salary ON jobs (is_valid_salary);
CREATE INDEX idx_jobs_posting_date ON jobs (posting_date);

-- Technical Skills Taxonomy Table
CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'General'
);

CREATE INDEX idx_skills_name ON skills (name);

-- Many-to-Many Job-to-Skills Normalized Association Table
CREATE TABLE job_skills (
    job_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
);

CREATE INDEX idx_job_skills_skill_id ON job_skills (skill_id);

-- Dataset Metadata & Audit Table
CREATE TABLE dataset_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_name VARCHAR(150) NOT NULL,
    source VARCHAR(255),
    record_count INTEGER NOT NULL,
    is_synthetic_labeled BOOLEAN DEFAULT 1,
    metadata_json TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
