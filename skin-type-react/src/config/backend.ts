// Backend API Configuration
// This app uses the backend at ponce-patient-backend.vercel.app for all Airtable operations
// API keys stay secure on the backend - never exposed to client

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'https://ponce-patient-backend.vercel.app';

// Determine if we should use backend API
// In production, always use backend API
// In development, can use backend API or local API routes
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API !== 'false'; // Default to true

export const getBackendApiUrl = (): string => {
  return BACKEND_API_URL;
};

export const shouldUseBackendApi = (): boolean => {
  return USE_BACKEND_API;
};

// Backend API endpoints
// The backend at ponce-patient-backend.vercel.app provides these endpoints:
// - GET /api/dashboard/leads?tableName=Photos - Fetch cases/photos
// - POST /api/dashboard/leads - Create lead
// - PATCH /api/dashboard/leads/:recordId - Update lead
export const BACKEND_ENDPOINTS = {
  // Cases/Photos - Uses the leads endpoint with tableName=Photos
  getCases: (tableName: string = 'Photos') => {
    const url = new URL(`${BACKEND_API_URL}/api/dashboard/leads`);
    url.searchParams.append('tableName', tableName);
    return url.toString();
  },
  
  // Leads
  createLead: () => 
    `${BACKEND_API_URL}/api/dashboard/leads`,
  
  updateLead: (recordId: string) => 
    `${BACKEND_API_URL}/api/dashboard/leads/${recordId}`,
};

// Local API routes (fallback, only if backend is not available)
export const LOCAL_API_ENDPOINTS = {
  getCases: '/api/airtable-cases',
  createLead: '/api/airtable-leads',
  updateLead: (recordId: string) => `/api/airtable-update-lead?recordId=${recordId}`,
};

export const getApiUrl = (endpoint: keyof typeof BACKEND_ENDPOINTS, ...args: any[]): string => {
  if (shouldUseBackendApi()) {
    if (endpoint === 'getCases') {
      return BACKEND_ENDPOINTS.getCases(args[0]);
    } else if (endpoint === 'createLead') {
      return BACKEND_ENDPOINTS.createLead();
    } else if (endpoint === 'updateLead') {
      return BACKEND_ENDPOINTS.updateLead(args[0]);
    }
  }
  // Fallback to local API routes
  if (endpoint === 'getCases') {
    return LOCAL_API_ENDPOINTS.getCases;
  } else if (endpoint === 'createLead') {
    return LOCAL_API_ENDPOINTS.createLead;
  } else if (endpoint === 'updateLead') {
    return LOCAL_API_ENDPOINTS.updateLead(args[0]);
  }
  return '';
};
