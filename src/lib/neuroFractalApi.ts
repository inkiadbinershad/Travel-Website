import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import * as backendApi from './backendApi';

type NeuroFractalSession = Database['public']['Tables']['neuro_fractal_sessions']['Row'];
type NeuroFractalState = Database['public']['Tables']['neuro_fractal_states']['Row'];
type NeuroFractalMessage = Database['public']['Tables']['neuro_fractal_messages']['Row'];
type NeuroFractalMetric = Database['public']['Tables']['neuro_fractal_metrics']['Row'];
type NeuroFractalAdaptation = Database['public']['Tables']['neuro_fractal_adaptations']['Row'];

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

export interface CreateMetricData {
  user_id: string;
  session_id?: string;
  metric_type: string;
  metric_value?: number;
  metric_metadata?: Record<string, any>;
}

export interface CreateAdaptationData {
  user_id: string;
  adaptation_type: string;
  adaptation_data: Record<string, any>;
  effectiveness_score?: number;
  applied_at?: string;
}

// Session Management
export const createNeuroFractalSession = async (data: CreateSessionData): Promise<NeuroFractalSession> => {
  const { data: session, error } = await supabase
    .from('neuro_fractal_sessions')
    .insert({
      user_id: data.user_id,
      session_name: data.session_name,
      is_active: true,
      adaptation_level: 0.5
    })
    .select()
    .single();

  if (error) throw error;
  return session;
};

export const getActiveSession = async (userId: string): Promise<NeuroFractalSession | null> => {
  const { data: session, error } = await supabase
    .from('neuro_fractal_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return session;
};

export const getUserSessions = async (userId: string): Promise<NeuroFractalSession[]> => {
  try {
    return await backendApi.getUserSessions(userId);
  } catch (error) {
    // Fallback to direct Supabase call if backend is unavailable
    const { data: sessions, error: supabaseError } = await supabase
      .from('neuro_fractal_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (supabaseError) throw supabaseError;
    return sessions || [];
  }
};

export const updateSessionActivity = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('neuro_fractal_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
};

export const deactivateSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('neuro_fractal_sessions')
    .update({ is_active: false })
    .eq('id', sessionId);

  if (error) throw error;
};

// State Management
export const createNeuroFractalState = async (data: CreateStateData): Promise<NeuroFractalState> => {
  const { data: state, error } = await supabase
    .from('neuro_fractal_states')
    .insert({
      session_id: data.session_id,
      coherence: data.coherence,
      complexity: data.complexity,
      resonance: data.resonance,
      adaptation_level: data.adaptation_level || 0.5,
      emotional_stability: data.emotional_stability || 0.5,
      cognitive_load: data.cognitive_load || 0.3,
      fractal_dimension: data.fractal_dimension || 1.5,
      quantum_entropy: data.quantum_entropy || 0.0001
    })
    .select()
    .single();

  if (error) throw error;
  return state;
};

export const getSessionStates = async (sessionId: string): Promise<NeuroFractalState[]> => {
  const { data: states, error } = await supabase
    .from('neuro_fractal_states')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return states || [];
};

export const getLatestState = async (sessionId: string): Promise<NeuroFractalState | null> => {
  const { data: state, error } = await supabase
    .from('neuro_fractal_states')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return state;
};

// Message Management
export const createNeuroFractalMessage = async (data: CreateMessageData): Promise<NeuroFractalMessage> => {
  const { data: message, error } = await supabase
    .from('neuro_fractal_messages')
    .insert({
      session_id: data.session_id,
      user_id: data.user_id,
      message_type: data.message_type,
      content: data.content,
      state_id: data.state_id,
      coherence_at_message: data.coherence_at_message,
      complexity_at_message: data.complexity_at_message,
      resonance_at_message: data.resonance_at_message,
      emotional_response: data.emotional_response,
      cognitive_patterns: data.cognitive_patterns
    })
    .select()
    .single();

  if (error) throw error;
  return message;
};

export const getSessionMessages = async (sessionId: string): Promise<NeuroFractalMessage[]> => {
  const { data: messages, error } = await supabase
    .from('neuro_fractal_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return messages || [];
};

// Metrics Management
export const createNeuroFractalMetric = async (data: CreateMetricData): Promise<NeuroFractalMetric> => {
  const { data: metric, error } = await supabase
    .from('neuro_fractal_metrics')
    .insert({
      user_id: data.user_id,
      session_id: data.session_id,
      metric_type: data.metric_type,
      metric_value: data.metric_value,
      metric_metadata: data.metric_metadata
    })
    .select()
    .single();

  if (error) throw error;
  return metric;
};

export const getUserMetrics = async (userId: string, metricType?: string): Promise<NeuroFractalMetric[]> => {
  let query = supabase
    .from('neuro_fractal_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (metricType) {
    query = query.eq('metric_type', metricType);
  }

  const { data: metrics, error } = await query;

  if (error) throw error;
  return metrics || [];
};

export const getSessionMetrics = async (sessionId: string): Promise<NeuroFractalMetric[]> => {
  const { data: metrics, error } = await supabase
    .from('neuro_fractal_metrics')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return metrics || [];
};

// Adaptation Management
export const createNeuroFractalAdaptation = async (data: CreateAdaptationData): Promise<NeuroFractalAdaptation> => {
  const { data: adaptation, error } = await supabase
    .from('neuro_fractal_adaptations')
    .insert({
      user_id: data.user_id,
      adaptation_type: data.adaptation_type,
      adaptation_data: data.adaptation_data,
      effectiveness_score: data.effectiveness_score,
      applied_at: data.applied_at
    })
    .select()
    .single();

  if (error) throw error;
  return adaptation;
};

export const getUserAdaptations = async (userId: string): Promise<NeuroFractalAdaptation[]> => {
  const { data: adaptations, error } = await supabase
    .from('neuro_fractal_adaptations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return adaptations || [];
};

export const updateAdaptationEffectiveness = async (adaptationId: string, score: number): Promise<void> => {
  try {
    await backendApi.updateAdaptationEffectiveness(adaptationId, score);
  } catch (error) {
    // Fallback to direct Supabase call if backend is unavailable
    const { error: supabaseError } = await supabase
      .from('neuro_fractal_adaptations')
      .update({
        effectiveness_score: score,
        applied_at: new Date().toISOString()
      })
      .eq('id', adaptationId);

    if (supabaseError) throw supabaseError;
  }
};

// Analytics Functions
export const getSessionAnalytics = async (sessionId: string) => {
  const { data: session, error: sessionError } = await supabase
    .from('neuro_fractal_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;

  const [states, messages, metrics] = await Promise.all([
    getSessionStates(sessionId),
    getSessionMessages(sessionId),
    getSessionMetrics(sessionId)
  ]);

  return {
    session,
    states,
    messages,
    metrics,
    analytics: {
      totalMessages: messages.length,
      averageCoherence: states.reduce((sum, state) => sum + state.coherence, 0) / states.length || 0,
      averageComplexity: states.reduce((sum, state) => sum + state.complexity, 0) / states.length || 0,
      averageResonance: states.reduce((sum, state) => sum + state.resonance, 0) / states.length || 0,
      sessionDuration: session ? new Date(session.updated_at).getTime() - new Date(session.created_at).getTime() : 0
    }
  };
};

export const getUserAnalytics = async (userId: string) => {
  const sessions = await getUserSessions(userId);
  const adaptations = await getUserAdaptations(userId);

  const sessionAnalytics = await Promise.all(
    sessions.map(session => getSessionAnalytics(session.id))
  );

  return {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.is_active).length,
    totalMessages: sessionAnalytics.reduce((sum, sa) => sum + sa.analytics.totalMessages, 0),
    averageCoherence: sessionAnalytics.reduce((sum, sa) => sum + sa.analytics.averageCoherence, 0) / sessionAnalytics.length || 0,
    adaptations: adaptations,
    recentSessions: sessions.slice(0, 5)
  };
};
