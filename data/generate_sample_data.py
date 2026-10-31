"""Script to generate realistic, transparently-labeled sample IT job market data."""
import random
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd

# Set fixed seed for reproducibility
random.seed(42)

ROLES_CONFIG = [
    {
        "role": "Frontend Developer",
        "raw_titles": ["Senior React Developer", "Frontend Engineer", "React.js Developer", "UI/UX Developer", "Angular/Vue Frontend Specialist", "Lead Frontend Architect"],
        "skills": ["React", "TypeScript", "JavaScript", "Tailwind CSS", "Next.js", "HTML/CSS", "Git", "REST APIs", "Redux", "GraphQL"],
        "base_salary_min": 600000,
        "base_salary_max": 2400000,
        "exp_weight": 220000
    },
    {
        "role": "Backend Developer",
        "raw_titles": ["Python Backend Developer", "Java Spring Boot Engineer", "Backend Software Engineer", "Go Backend Developer", "Node.js Backend Specialist", "Senior API Engineer"],
        "skills": ["Python", "Java", "Spring Boot", "FastAPI", "PostgreSQL", "Redis", "Docker", "Microservices", "REST APIs", "Go", "SQL"],
        "base_salary_min": 700000,
        "base_salary_max": 2800000,
        "exp_weight": 250000
    },
    {
        "role": "Full Stack Developer",
        "raw_titles": ["Full Stack Developer", "MERN Stack Engineer", "Senior Full Stack Specialist", "Full Stack Software Engineer", "Fullstack Web Architect"],
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "Docker", "Git", "REST APIs", "Express.js", "AWS"],
        "base_salary_min": 750000,
        "base_salary_max": 3000000,
        "exp_weight": 260000
    },
    {
        "role": "Data Scientist",
        "raw_titles": ["Data Scientist", "Applied Scientist", "Senior Data Scientist", "Analytics & Data Science Specialist", "Lead Data Scientist"],
        "skills": ["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Matplotlib", "PyTorch", "TensorFlow", "Statistics", "Apache Spark"],
        "base_salary_min": 900000,
        "base_salary_max": 3400000,
        "exp_weight": 300000
    },
    {
        "role": "Machine Learning Engineer",
        "raw_titles": ["Machine Learning Engineer", "MLOps Engineer", "Senior ML Specialist", "Deep Learning Engineer", "AI/ML Engineer"],
        "skills": ["Python", "PyTorch", "TensorFlow", "Docker", "Kubernetes", "FastAPI", "AWS", "Scikit-Learn", "MLOps", "Linux"],
        "base_salary_min": 1000000,
        "base_salary_max": 3800000,
        "exp_weight": 320000
    },
    {
        "role": "DevOps Engineer",
        "raw_titles": ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud & DevOps Specialist", "Infrastructure Platform Engineer", "Senior SRE"],
        "skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Git", "Jenkins", "Azure", "Python"],
        "base_salary_min": 850000,
        "base_salary_max": 3200000,
        "exp_weight": 280000
    },
    {
        "role": "Cloud Engineer",
        "raw_titles": ["Cloud Solutions Architect", "AWS Cloud Engineer", "Azure Infrastructure Specialist", "Cloud Platform Engineer"],
        "skills": ["AWS", "Azure", "Google Cloud", "Terraform", "Docker", "Kubernetes", "Linux", "CI/CD", "Python"],
        "base_salary_min": 900000,
        "base_salary_max": 3300000,
        "exp_weight": 290000
    },
    {
        "role": "Data Engineer",
        "raw_titles": ["Data Engineer", "Big Data Developer", "Senior ETL Engineer", "Data Pipeline Specialist", "Data Platform Architect"],
        "skills": ["SQL", "Python", "Apache Spark", "Kafka", "PostgreSQL", "AWS", "Docker", "Hadoop", "Airflow"],
        "base_salary_min": 800000,
        "base_salary_max": 3200000,
        "exp_weight": 270000
    },
    {
        "role": "Mobile Developer",
        "raw_titles": ["React Native Developer", "Flutter Mobile Engineer", "iOS / Android Developer", "Mobile App Specialist"],
        "skills": ["React Native", "Flutter", "TypeScript", "JavaScript", "iOS", "Android", "REST APIs", "Git"],
        "base_salary_min": 650000,
        "base_salary_max": 2500000,
        "exp_weight": 230000
    },
    {
        "role": "QA / Automation Engineer",
        "raw_titles": ["QA Automation Engineer", "SDET (Software Development Engineer in Test)", "Lead Quality Assurance Engineer", "Test Automation Specialist"],
        "skills": ["Python", "Java", "Selenium", "CI/CD", "Git", "REST APIs", "Docker", "Linux", "Postman", "Cypress"],
        "base_salary_min": 550000,
        "base_salary_max": 2000000,
        "exp_weight": 190000
    }
]

COMPANIES = [
    "Apex Cloud Systems", "Nexus Infotech Solutions", "ZenPeak Software", "DataForge AI",
    "Velocity Technologies", "FinTech Horizons", "InfraCore Labs", "CyberVault Security",
    "Starlight Interactive", "Elevate Global Tech", "AuraScale Systems", "BluePulse Digital",
    "CognitiveWave Labs", "Hyperion Analytics", "QuantumStack Technologies", "MetroByte Innovations",
    "Prism Data Systems", "Synergy Global Soft", "Vanguard AI Solutions", "Optima Tech Services"
]

LOCATIONS = [
    ("Bengaluru", 0.30, False),
    ("Hyderabad", 0.20, False),
    ("Pune", 0.15, False),
    ("Delhi NCR", 0.12, False),
    ("Mumbai", 0.08, False),
    ("Chennai", 0.05, False),
    ("Remote", 0.10, True)
]

def generate_dataset(num_records: int = 1500) -> pd.DataFrame:
    records = []
    start_date = datetime(2025, 10, 1)
    
    for i in range(num_records):
        role_cfg = random.choice(ROLES_CONFIG)
        raw_title = random.choice(role_cfg["raw_titles"])
        company = random.choice(COMPANIES)
        
        # Pick location
        loc_choices, weights, _ = zip(*[(l[0], l[1], l[2]) for l in LOCATIONS])
        location = random.choices(loc_choices, weights=weights)[0]
        is_remote = location == "Remote" or (random.random() < 0.15)
        
        # Experience: 0 to 14 years
        exp_years = round(random.triangular(0.5, 12.0, 3.5), 1)
        
        # Required skills (3 to 6 skills)
        available_skills = role_cfg["skills"]
        num_skills = random.randint(3, min(6, len(available_skills)))
        selected_skills = random.sample(available_skills, num_skills)
        
        # In 10% of cases, add an extra cross-discipline skill (e.g. AWS, Docker)
        if random.random() < 0.25 and "Docker" not in selected_skills:
            selected_skills.append("Docker")
        if random.random() < 0.20 and "AWS" not in selected_skills:
            selected_skills.append("AWS")
            
        skills_str = ", ".join(selected_skills)
        
        # Salary logic:
        # ~25% missing salary (realistic for job boards)
        # ~5% USD currency (global/remote roles)
        # ~5% monthly period
        # ~2% unknown currency (testing robustness)
        # ~68% INR annual
        salary_type_rand = random.random()
        
        if salary_type_rand < 0.25:
            # Undisclosed salary
            sal_min, sal_max, currency, period = None, None, None, None
        else:
            # Calculate realistic salary based on role base + experience + skills bonus
            skill_bonus = len(selected_skills) * 35000
            loc_multiplier = 1.15 if location in ["Bengaluru", "San Francisco"] else (0.95 if location == "Pune" else 1.0)
            
            calc_base = (role_cfg["base_salary_min"] + exp_years * role_cfg["exp_weight"] + skill_bonus) * loc_multiplier
            # Add normal noise
            calc_base = max(350000, calc_base * random.uniform(0.9, 1.12))
            
            spread = random.uniform(1.2, 1.45)
            sal_min_inr = round(calc_base, -3)
            sal_max_inr = round(calc_base * spread, -3)
            
            if salary_type_rand < 0.30:
                # USD
                sal_min = round(sal_min_inr / 83.5, -2)
                sal_max = round(sal_max_inr / 83.5, -2)
                currency = "USD"
                period = "annual"
            elif salary_type_rand < 0.35:
                # Monthly INR
                sal_min = round(sal_min_inr / 12, -2)
                sal_max = round(sal_max_inr / 12, -2)
                currency = "INR"
                period = "monthly"
            elif salary_type_rand < 0.37:
                # Unknown currency to test pipeline robustness
                sal_min = sal_min_inr
                sal_max = sal_max_inr
                currency = "XYZ"
                period = "annual"
            else:
                # Standard annual INR
                sal_min = sal_min_inr
                sal_max = sal_max_inr
                currency = "INR"
                period = "annual"
                
        # Posting date across the last 6 months (180 days)
        day_offset = random.randint(0, 180)
        post_date = (start_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        # Employment type
        emp_type = random.choices(["Full-time", "Contract", "Internship", "Part-time"], weights=[0.85, 0.10, 0.03, 0.02])[0]
        
        # Realistic job description
        desc = (
            f"We are hiring a passionate {raw_title} to join {company}. "
            f"The ideal candidate will have strong experience with {', '.join(selected_skills[:3])}. "
            f"You will work closely with cross-functional product and engineering teams to build resilient scalable solutions."
        )
        
        records.append({
            "job_title": raw_title,
            "company": company,
            "location": location,
            "country": "India" if location != "Remote" else "Global",
            "experience_years": exp_years,
            "experience_level": "Senior" if exp_years >= 6 else ("Mid" if exp_years >= 3 else "Entry"),
            "employment_type": emp_type,
            "salary_min": sal_min,
            "salary_max": sal_max,
            "salary_currency": currency,
            "salary_period": period,
            "required_skills": skills_str,
            "job_description": desc,
            "is_remote": is_remote,
            "posting_date": post_date,
            "source": "Curated Tech Job Board Benchmark Feed"
        })
        
    # Introduce ~15 duplicate records to verify deduplication pipeline
    for _ in range(15):
        dup_row = random.choice(records).copy()
        records.append(dup_row)
        
    return pd.DataFrame(records)

if __name__ == "__main__":
    out_dir = Path(__file__).resolve().parent / "raw"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "sample_jobs_raw.csv"
    
    df = generate_dataset(num_records=1600)
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} sample job postings at: {out_path}")
