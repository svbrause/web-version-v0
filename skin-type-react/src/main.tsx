import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import NotFound from './components/NotFound.tsx'
import { getPracticeFromConfig } from './components/Logo.tsx'
import './index.css'
import { initAnalytics } from './utils/analytics.ts'

// Initialize analytics
initAnalytics();

function HomeOrNotFound() {
  const practice = getPracticeFromConfig();
  if (practice === null) return <NotFound />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeOrNotFound />} />
        <Route path="/admin" element={<App />} />
        <Route path="/lakeshore" element={<App />} />
        <Route path="/unique" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
