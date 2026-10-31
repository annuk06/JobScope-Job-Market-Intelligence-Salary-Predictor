"""Data normalization, cleaning, and deduplication logic."""
import re
from typing import List, Optional, Set

# Standard job roles canonical taxonomy
ROLE_MAPPINGS = [
    (r"\b(frontend|front-end|front end|react|angular|vue|ui dev|ui engineer)\b", "Frontend Developer"),
    (r"\b(full\s*stack|fullstack|mern|mean)\b", "Full Stack Developer"),
    (r"\b(backend|back-end|back end|java dev|python dev|golang dev|node dev|\.net dev)\b", "Backend Developer"),
    (r"\b(machine\s*learning|ml\s*eng|deep\s*learning|nlp|computer\s*vision|ai\s*eng)\b", "Machine Learning Engineer"),
    (r"\b(data\s*scientist|applied\s*scientist|data\s*science)\b", "Data Scientist"),
    (r"\b(data\s*engineer|etl|big\s*data|data\s*pipeline)\b", "Data Engineer"),
    (r"\b(devops|sre|site\s*reliability|platform\s*eng|infrastructure)\b", "DevOps Engineer"),
    (r"\b(cloud.*architect|cloud\s*eng|aws\s*eng|azure\s*eng|cloud\s*solutions)\b", "Cloud Engineer"),
    (r"\b(mobile|android|ios|flutter|react\s*native)\b", "Mobile Developer"),
    (r"\b(qa|sdet|test\s*eng|quality\s*assurance|automation\s*test)\b", "QA / Automation Engineer"),
    (r"\b(security|cybersecurity|infosec)\b", "Cybersecurity Analyst"),
    (r"\b(product\s*manager|tech\s*lead|engineering\s*manager)\b", "Engineering Manager")
]

# Standard locations taxonomy
LOCATION_MAPPINGS = [
    (r"\b(bengaluru|bangalore|blr)\b", "Bengaluru"),
    (r"\b(hyderabad|hyd)\b", "Hyderabad"),
    (r"\b(pune)\b", "Pune"),
    (r"\b(delhi|noida|gurgaon|gurugram|ncr)\b", "Delhi NCR"),
    (r"\b(mumbai|bombay|navi\s*mumbai)\b", "Mumbai"),
    (r"\b(chennai|madras)\b", "Chennai"),
    (r"\b(remote|work\s*from\s*home|wfh|anywhere)\b", "Remote"),
    (r"\b(san\s*francisco|sf|bay\s*area|california)\b", "San Francisco"),
    (r"\b(new\s*york|nyc)\b", "New York"),
    (r"\b(london|uk)\b", "London")
]

# Standard technical skills dictionary for canonical representation
CANONICAL_SKILLS = {
    "python": "Python",
    "python3": "Python",
    "py": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    ".net": ".NET",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "git": "Git",
    "github": "GitHub",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    "linux": "Linux",
    "terraform": "Terraform",
    "kafka": "Kafka",
    "spark": "Apache Spark",
    "hadoop": "Hadoop",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "rest api": "REST APIs",
    "graphql": "GraphQL",
    "microservices": "Microservices",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "html": "HTML/CSS",
    "css": "HTML/CSS",
    "next.js": "Next.js",
    "nextjs": "Next.js"
}

def normalize_title(title: Optional[str]) -> str:
    """Map raw job title to canonical industry job role."""
    if not title:
        return "Software Engineer (General)"
    t_lower = title.lower()
    for pattern, canonical in ROLE_MAPPINGS:
        if re.search(pattern, t_lower):
            return canonical
    return title.strip()

def normalize_location(location: Optional[str], is_remote: bool = False) -> str:
    """Map location string or remote flag to canonical tech hub."""
    if is_remote:
        return "Remote"
    if not location:
        return "Other / Unspecified"
    loc_lower = location.lower()
    for pattern, canonical in LOCATION_MAPPINGS:
        if re.search(pattern, loc_lower):
            return canonical
    return location.strip().title()

def extract_and_normalize_skills(raw_skills: Optional[str], description: Optional[str] = None) -> List[str]:
    """
    Extract, clean, and normalize skills from comma/pipe-separated skill strings
    or job description text.
    """
    found_skills: Set[str] = set()
    
    if raw_skills:
        # Split by comma, pipe, semicolon, or slash
        parts = re.split(r"[,;|/]", str(raw_skills))
        for p in parts:
            cleaned = p.strip().lower()
            if cleaned in CANONICAL_SKILLS:
                found_skills.add(CANONICAL_SKILLS[cleaned])
            elif len(cleaned) > 1 and len(cleaned) < 30:
                # Capitalize words
                found_skills.add(cleaned.title())
                
    if description and len(found_skills) < 3:
        desc_lower = description.lower()
        for key, canonical in CANONICAL_SKILLS.items():
            # Check with word boundary
            pattern = r"\b" + re.escape(key) + r"\b"
            if re.search(pattern, desc_lower):
                found_skills.add(canonical)
                
    return sorted(list(found_skills))

def normalize_experience_level(years: Optional[float], text_level: Optional[str] = None) -> str:
    """Classify into standard experience bands."""
    if years is not None and years >= 0:
        if years < 2:
            return "Entry Level (0-2 yrs)"
        elif years < 5:
            return "Mid Level (3-5 yrs)"
        elif years < 8:
            return "Senior Level (6-8 yrs)"
        else:
            return "Lead / Principal (8+ yrs)"
            
    if text_level:
        lvl = text_level.lower()
        if "entry" in lvl or "junior" in lvl or "intern" in lvl or "fresher" in lvl:
            return "Entry Level (0-2 yrs)"
        if "mid" in lvl or "associate" in lvl:
            return "Mid Level (3-5 yrs)"
        if "senior" in lvl or "sr" in lvl:
            return "Senior Level (6-8 yrs)"
        if "lead" in lvl or "principal" in lvl or "director" in lvl or "architect" in lvl:
            return "Lead / Principal (8+ yrs)"
            
    return "Mid Level (3-5 yrs)"
