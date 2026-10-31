-- =========================================================================
-- JobScope Analytical SQL Queries
-- Answering core tech labor market, skill demand, and compensation questions
-- =========================================================================

-- 1. Which job roles appear most frequently?
-- Calculates total postings and market share percentage per normalized role.
SELECT 
    normalized_title AS role,
    COUNT(*) AS total_postings,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM jobs), 2) AS market_share_percentage
FROM jobs
GROUP BY normalized_title
ORDER BY total_postings DESC;

-- 2. Which skills are requested most often?
-- Uses normalized job_skills association table to avoid multi-counting rows.
SELECT 
    s.name AS skill_name,
    COUNT(js.job_id) AS mention_count,
    ROUND(COUNT(js.job_id) * 100.0 / (SELECT COUNT(*) FROM jobs), 2) AS demand_percentage
FROM skills s
JOIN job_skills js ON s.id = js.skill_id
GROUP BY s.id, s.name
ORDER BY mention_count DESC
LIMIT 20;

-- 3. What is the average and median advertised annual salary by role?
-- Filters exclusively for records with validated annual salary to prevent distortion.
SELECT 
    normalized_title AS role,
    COUNT(*) AS sample_size,
    ROUND(AVG(annual_salary_avg), 0) AS mean_annual_salary,
    ROUND(MIN(annual_salary_avg), 0) AS min_annual_salary,
    ROUND(MAX(annual_salary_avg), 0) AS max_annual_salary
FROM jobs
WHERE is_valid_salary = 1
GROUP BY normalized_title
HAVING COUNT(*) >= 5
ORDER BY mean_annual_salary DESC;

-- 4. How do salaries vary across experience levels?
SELECT 
    experience_level,
    COUNT(*) AS postings_count,
    ROUND(AVG(experience_years), 1) AS avg_years_experience,
    ROUND(AVG(annual_salary_avg), 0) AS mean_annual_salary
FROM jobs
WHERE is_valid_salary = 1
GROUP BY experience_level
ORDER BY avg_years_experience ASC;

-- 5. Which locations have the most tech job postings?
SELECT 
    normalized_location AS location,
    COUNT(*) AS total_postings,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM jobs), 2) AS location_share_percentage,
    ROUND(AVG(CASE WHEN is_valid_salary = 1 THEN annual_salary_avg ELSE NULL END), 0) AS mean_salary_inr
FROM jobs
GROUP BY normalized_location
ORDER BY total_postings DESC;

-- 6. What proportion of tech job postings disclose valid salary figures?
SELECT 
    COUNT(*) AS total_records,
    SUM(CASE WHEN is_valid_salary = 1 THEN 1 ELSE 0 END) AS valid_salary_records,
    SUM(CASE WHEN is_valid_salary = 0 THEN 1 ELSE 0 END) AS undisclosed_or_invalid_salary_records,
    ROUND(SUM(CASE WHEN is_valid_salary = 1 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*), 2) AS disclosure_rate_percentage
FROM jobs;

-- 7. Which skill combinations frequently co-occur in the same job postings?
-- Self-join on job_skills to discover synergistic skill pairs
SELECT 
    s1.name AS skill_a,
    s2.name AS skill_b,
    COUNT(*) AS pair_frequency
FROM job_skills js1
JOIN job_skills js2 ON js1.job_id = js2.job_id AND js1.skill_id < js2.skill_id
JOIN skills s1 ON js1.skill_id = s1.id
JOIN skills s2 ON js2.skill_id = s2.id
GROUP BY s1.name, s2.name
HAVING COUNT(*) >= 10
ORDER BY pair_frequency DESC
LIMIT 20;

-- 8. How does remote-work availability vary across technical roles?
SELECT 
    normalized_title AS role,
    COUNT(*) AS total_postings,
    SUM(CASE WHEN is_remote = 1 THEN 1 ELSE 0 END) AS remote_postings,
    ROUND(SUM(CASE WHEN is_remote = 1 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*), 2) AS remote_percentage
FROM jobs
GROUP BY normalized_title
ORDER BY remote_percentage DESC;

-- 9. Which roles possess sufficient salary observations (N >= 30) for reliable statistical comparison?
SELECT 
    normalized_title AS role,
    COUNT(CASE WHEN is_valid_salary = 1 THEN 1 END) AS valid_observations_count,
    ROUND(AVG(CASE WHEN is_valid_salary = 1 THEN annual_salary_avg END), 0) AS avg_salary,
    CASE 
        WHEN COUNT(CASE WHEN is_valid_salary = 1 THEN 1 END) >= 30 THEN 'Statistically Reliable (N >= 30)'
        ELSE 'Limited Sample (Interpret Cautiously)'
    END AS reliability_tier
FROM jobs
GROUP BY normalized_title
ORDER BY valid_observations_count DESC;
