const API_BASE_URL = 'http://localhost:3001/api';

export interface CreateSessionData {
  user_id: string;
  session_name?: string;
}

export interface CreateStateData {
  session_id: string;
  coherence: number;
  complexity: number;
  resonance: number;
  adaptation_level?: number;
  emotional_stability?: number;
  cognitive_load?: number;
  fractal_dimension?: number;
  quantum_entropy?: number;
}

export interface CreateMessageData {
  session_id: string;
  user_id: string;
  message_type: 'user' | 'ai' | 'system';
  content: string;
  state_id?: string;
  coherence_at_message?: number;
  complexity_at_message?: number;
  resonance_at_message?: number;
  emotional_response?: Record<string, any>;
  cognitive_patterns?: Record<string, any>;
}

export interface CreateAdaptationData {
  user_id: string;
  adaptation_type: string;
  adaptation_data: Record<string, any>;
  effectiveness_score?: number;
  applied_at?: string;
}

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Session Management
export const createNeuroFractalSession = async (data: CreateSessionData) => {
  return apiCall('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getUserSessions = async (userId: string) => {
  return apiCall(`/sessions/${userId}`);
};

export const deactivateSession = async (sessionId: string) => {
  return apiCall(`/sessions/${sessionId}/deactivate`, {
    method: 'PUT',
  });
};

// Adaptation Management
export const getUserAdaptations = async (userId: string) => {
  return apiCall(`/adaptations/${userId}`);
};

export const createNeuroFractalAdaptation = async (data: CreateAdaptationData) => {
  return apiCall('/adaptations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAdaptationEffectiveness = async (adaptationId: string, score: number) => {
  return apiCall(`/adaptations/${adaptationId}`, {
    method: 'PUT',
    body: JSON.stringify({ effectiveness_score: score }),
  });
};

// Health check
export const checkBackendHealth = async () => {
  return apiCall('/health');
};
