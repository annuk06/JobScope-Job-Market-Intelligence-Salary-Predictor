import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import SkillDemandPage from './pages/SkillDemandPage';
import SalaryPredictorPage from './pages/SalaryPredictorPage';
import SkillGapPage from './pages/SkillGapPage';
import HiringTrendsPage from './pages/HiringTrendsPage';
import JobExplorerPage from './pages/JobExplorerPage';
import ModelInfoPage from './pages/ModelInfoPage';

const AppContent: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/':
        return 'JobScope — Tech Labor Market Intelligence';
      case '/overview':
        return 'Executive Overview Dashboard';
      case '/skills':
        return 'Skill Demand & Co-occurrence Analyzer';
      case '/predictor':
        return 'Machine Learning Salary Predictor';
      case '/skill-gap':
        return 'Empirical Skill Gap Analyzer';
      case '/trends':
        return 'Hiring & Compensation Trends';
      case '/explorer':
        return 'Jobs & Records Data Explorer';
      case '/dataset-model':
        return 'Dataset Audit & ML Model Information';
      default:
        return 'JobScope';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar title={getPageTitle(location.pathname)} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/skills" element={<SkillDemandPage />} />
          <Route path="/predictor" element={<SalaryPredictorPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/trends" element={<HiringTrendsPage />} />
          <Route path="/explorer" element={<JobExplorerPage />} />
          <Route path="/dataset-model" element={<ModelInfoPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
