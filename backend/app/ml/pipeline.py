"""Machine Learning feature preprocessing and pipeline construction."""
from typing import List, Set
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline

class MultiHotSkillsEncoder(BaseEstimator, TransformerMixin):
    """Custom transformer to multi-hot encode lists of technical skills."""
    def __init__(self, min_skill_freq: int = 5):
        self.min_skill_freq = min_skill_freq
        self.vocabulary_: List[str] = []
        self.skill_to_idx_: dict = {}
        
    def fit(self, X, y=None):
        skill_counts = {}
        for skill_list in X:
            if isinstance(skill_list, (list, set, tuple)):
                for s in skill_list:
                    s_clean = str(s).strip()
                    skill_counts[s_clean] = skill_counts.get(s_clean, 0) + 1
                    
        # Filter skills meeting minimum frequency
        self.vocabulary_ = sorted([
            skill for skill, count in skill_counts.items()
            if count >= self.min_skill_freq
        ])
        self.skill_to_idx_ = {skill: i for i, skill in enumerate(self.vocabulary_)}
        return self
        
    def transform(self, X):
        matrix = np.zeros((len(X), len(self.vocabulary_)), dtype=np.float32)
        for row_idx, skill_list in enumerate(X):
            if isinstance(skill_list, (list, set, tuple)):
                for s in skill_list:
                    s_clean = str(s).strip()
                    if s_clean in self.skill_to_idx_:
                        matrix[row_idx, self.skill_to_idx_[s_clean]] = 1.0
        return matrix

def build_preprocessing_pipeline(min_skill_freq: int = 5) -> ColumnTransformer:
    """Creates scikit-learn preprocessing transformer pipeline."""
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat", 
                OneHotEncoder(handle_unknown="ignore", sparse_output=False), 
                ["normalized_title", "normalized_location", "employment_type"]
            ),
            (
                "num", 
                StandardScaler(), 
                ["experience_years"]
            ),
            (
                "skills", 
                MultiHotSkillsEncoder(min_skill_freq=min_skill_freq), 
                "skills_list"
            )
        ],
        remainder="drop"
    )
    return preprocessor

def create_full_pipeline(regressor, min_skill_freq: int = 5) -> Pipeline:
    """Builds unified pipeline with preprocessor and regressor."""
    preprocessor = build_preprocessing_pipeline(min_skill_freq=min_skill_freq)
    return Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", regressor)
    ])
