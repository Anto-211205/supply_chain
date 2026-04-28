/**
 * Centralized API Client
 * 
 * Provides typed fetch wrapper with:
 * - Base URL driven by VITE_API_URL env var (set at Vercel build time)
 * - Falls back to '' so the Vite dev-server proxy handles /api routing locally
 * - Error handling
 * - Response type safety
 * - Automatic JSON parsing
 */

// In production: VITE_API_URL = "https://supply-chain-api.onrender.com"
// In local dev:  VITE_API_URL = "" (proxy in vite.config.ts takes over)
const API_BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api/v1`;


// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface DashboardSummary {
  activeShipments: number;
  onTimeDeliveryRate: number;
  costSavings: number;
  activeAlerts: number;
  deliveryData: Array<any>;
  costData: Array<any>;
  riskDistribution: Array<any>;
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'on-time' | 'delayed' | 'in-transit' | 'delivered';
  currentLocation: string;
  eta: string;
  progress: number;
  carrier: string;
  delayRisk: 'low' | 'medium' | 'high';
}

export interface ShipmentDetail extends Shipment {
  timeline: Array<any>;
  notes: Array<any>;
}

export interface Alert {
  id: string;
  type: 'weather' | 'traffic' | 'geopolitical' | 'strike' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedShipments: number;
  location: string;
  timestamp: string;
  recommendation: string;
}

export interface ChatResponse {
  status: 'success' | 'error';
  message: string;
  session_id?: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  cost: number;
  savings: number;
  status: 'optimal' | 'alternative' | 'current';
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface Ship {
  id: string;
  name: string;
  status: string;
  location: string;
  coordinates: [number, number];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AnalyticsData {
  overallPerformance: number;
  totalShipments: number;
  costSavings: number;
  aiAccuracy: number;
  performanceData: Array<any>;
  volumeData: Array<any>;
  carrierPerformance: Array<any>;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  token?: string;
  user?: any;
}

export interface Inventory {
  items: Array<any>;
  lowStockItems: Array<any>;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class APIError extends Error {
  constructor(
    public status: number,
    public data: any,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// API METHODS
// ============================================================================

async function request<T>(
  method: string,
  endpoint: string,
  body?: any
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData,
        errorData.detail || errorData.message || `API Error: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error(`Failed to fetch ${endpoint}: ${error}`);
  }
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardAPI = {
  getSummary: () => request<DashboardSummary>('GET', '/dashboard/summary'),
};

// ============================================================================
// SHIPMENT TRACKING API
// ============================================================================

export const shipmentAPI = {
  getAll: () => request<Shipment[]>('GET', '/shipments'),
  getById: (id: string) => request<ShipmentDetail>('GET', `/shipments/${id}`),
  updateLocation: (id: string, lat: number, lon: number, status: string) =>
    request('PUT', `/shipments/${id}/location`, { lat, lon, status }),
  create: (shipmentData: any) => request('POST', '/shipments', shipmentData),
};

// ============================================================================
// ALERTS API
// ============================================================================

export const alertAPI = {
  getAll: () => request<Alert[]>('GET', '/alerts'),
  getRiskZones: () => request('GET', '/zones/risk'),
  getShipRisk: (shipId: string) => request('GET', `/ships/${shipId}/risk-status`),
};

// ============================================================================
// CHATBOT API
// ============================================================================

export const chatbotAPI = {
  ask: (message: string, sessionId?: string) =>
    request<ChatResponse>('POST', '/chatbot/ask', {
      message,
      session_id: sessionId || `session-${Date.now()}`,
    }),
};

// ============================================================================
// ROUTE OPTIMIZATION API
// ============================================================================

export const routeAPI = {
  optimize: (from_location: string, to_location: string, ship_id?: string) =>
    request<Route[]>('POST', '/ai/optimize-route', {
      from_location,
      to_location,
      ship_id,
    }),
  predictDelay: (shipmentId: string) =>
    request('POST', '/ai/predict-delay', { shipment_id: shipmentId }),
};

// ============================================================================
// SHIPS API
// ============================================================================

export const shipAPI = {
  getLive: () => request<Ship[]>('GET', '/ships/live'),
  getById: (id: string) => request<Ship>('GET', `/ships/${id}`),
  getSignalStatus: (id: string) => request('GET', `/ships/${id}/signal-status`),
  getAllSignals: () => request('GET', '/ships/signals/all'),
  gridDetect: (lat: number, lon: number) =>
    request('POST', '/ships/grid-detect', { lat, lon }),
};

// ============================================================================
// INVENTORY API
// ============================================================================

export const inventoryAPI = {
  getAll: () => request<Inventory>('GET', '/inventory'),
  getLowStock: () => request('GET', '/inventory/low-stock'),
  updateAfterDelivery: (shipmentId: string) =>
    request('POST', '/inventory/update-after-delivery', { shipment_id: shipmentId }),
};

// ============================================================================
// AUTH API (Backend routes needed)
// ============================================================================

export const authAPI = {
  login: (email: string, password: string) =>
    request<AuthResponse>('POST', '/auth/login', { email, password }),
  register: (userData: any) =>
    request<AuthResponse>('POST', '/auth/register', userData),
};

// ============================================================================
// COMPANY/PROFILE API (Backend route needed)
// ============================================================================

export const profileAPI = {
  updateProfile: (profileData: any) =>
    request('POST', '/company/profile', profileData),
};

// ============================================================================
// HELPER: Check API Connectivity
// ============================================================================

export async function checkAPIConnectivity(): Promise<boolean> {
  try {
    await dashboardAPI.getSummary();
    return true;
  } catch (error) {
    console.error('API connectivity check failed:', error);
    return false;
  }
}
