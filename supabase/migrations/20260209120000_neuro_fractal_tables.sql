-- Create NeuroFractal tables for enhanced chat system

-- Create neuro_fractal_sessions table
CREATE TABLE public.neuro_fractal_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  total_messages INTEGER DEFAULT 0,
  average_coherence DECIMAL(3, 2) DEFAULT 0,
  average_complexity DECIMAL(3, 2) DEFAULT 0,
  average_resonance DECIMAL(3, 2) DEFAULT 0,
  adaptation_level DECIMAL(3, 2) DEFAULT 0.5
);

-- Create neuro_fractal_states table
CREATE TABLE public.neuro_fractal_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.neuro_fractal_sessions(id) ON DELETE CASCADE,
  coherence DECIMAL(3, 2) NOT NULL CHECK (coherence >= 0 AND coherence <= 1),
  complexity DECIMAL(3, 2) NOT NULL CHECK (complexity >= 0 AND complexity <= 1),
  resonance DECIMAL(3, 2) NOT NULL CHECK (resonance >= 0 AND resonance <= 1),
  adaptation_level DECIMAL(3, 2) NOT NULL DEFAULT 0.5 CHECK (adaptation_level >= 0 AND adaptation_level <= 1),
  emotional_stability DECIMAL(3, 2) DEFAULT 0.5 CHECK (emotional_stability >= 0 AND emotional_stability <= 1),
  cognitive_load DECIMAL(3, 2) DEFAULT 0.3 CHECK (cognitive_load >= 0 AND cognitive_load <= 1),
  fractal_dimension DECIMAL(4, 3) DEFAULT 1.5 CHECK (fractal_dimension >= 1 AND fractal_dimension <= 2),
  quantum_entropy DECIMAL(5, 4) DEFAULT 0.0001 CHECK (quantum_entropy >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create neuro_fractal_messages table
CREATE TABLE public.neuro_fractal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.neuro_fractal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  state_id UUID REFERENCES public.neuro_fractal_states(id) ON DELETE SET NULL,
  coherence_at_message DECIMAL(3, 2),
  complexity_at_message DECIMAL(3, 2),
  resonance_at_message DECIMAL(3, 2),
  emotional_response JSONB DEFAULT '{}',
  cognitive_patterns JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create neuro_fractal_metrics table for analytics
CREATE TABLE public.neuro_fractal_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.neuro_fractal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10, 4),
  metric_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create neuro_fractal_adaptations table for AI learning
CREATE TABLE public.neuro_fractal_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  adaptation_type TEXT NOT NULL,
  adaptation_data JSONB NOT NULL,
  effectiveness_score DECIMAL(3, 2) DEFAULT 0,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create neuro_fractal_learning_patterns table for pattern analysis
CREATE TABLE public.neuro_fractal_learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_neuro_fractal_sessions_user_id ON public.neuro_fractal_sessions(user_id);
CREATE INDEX idx_neuro_fractal_sessions_active ON public.neuro_fractal_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_neuro_fractal_states_session_id ON public.neuro_fractal_states(session_id);
CREATE INDEX idx_neuro_fractal_messages_session_id ON public.neuro_fractal_messages(session_id);
CREATE INDEX idx_neuro_fractal_messages_user_id ON public.neuro_fractal_messages(user_id);
CREATE INDEX idx_neuro_fractal_metrics_session_id ON public.neuro_fractal_metrics(session_id);
CREATE INDEX idx_neuro_fractal_metrics_user_id ON public.neuro_fractal_metrics(user_id);
CREATE INDEX idx_neuro_fractal_adaptations_user_id ON public.neuro_fractal_adaptations(user_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_neuro_fractal_sessions_updated_at
  BEFORE UPDATE ON public.neuro_fractal_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update session statistics
CREATE OR REPLACE FUNCTION public.update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.neuro_fractal_sessions
  SET
    total_messages = (SELECT COUNT(*) FROM public.neuro_fractal_messages WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    average_coherence = (SELECT AVG(coherence) FROM public.neuro_fractal_states WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    average_complexity = (SELECT AVG(complexity) FROM public.neuro_fractal_states WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    average_resonance = (SELECT AVG(resonance) FROM public.neuro_fractal_states WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_session_stats_on_message
  AFTER INSERT OR UPDATE OR DELETE ON public.neuro_fractal_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_session_stats();

CREATE TRIGGER update_session_stats_on_state
  AFTER INSERT OR UPDATE OR DELETE ON public.neuro_fractal_states
  FOR EACH ROW EXECUTE FUNCTION public.update_session_stats();

-- Enable RLS on NeuroFractal tables
ALTER TABLE public.neuro_fractal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuro_fractal_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuro_fractal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuro_fractal_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuro_fractal_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuro_fractal_learning_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neuro_fractal_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.neuro_fractal_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.neuro_fractal_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.neuro_fractal_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.neuro_fractal_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for neuro_fractal_states
CREATE POLICY "Users can view states from their sessions"
  ON public.neuro_fractal_states FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.neuro_fractal_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can create states for their sessions"
  ON public.neuro_fractal_states FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.neuro_fractal_sessions WHERE id = session_id AND user_id = auth.uid()));

-- RLS Policies for neuro_fractal_messages
CREATE POLICY "Users can view messages from their sessions"
  ON public.neuro_fractal_messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.neuro_fractal_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can create messages in their sessions"
  ON public.neuro_fractal_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.neuro_fractal_sessions WHERE id = session_id AND user_id = auth.uid()));

-- RLS Policies for neuro_fractal_metrics
CREATE POLICY "Users can view their own metrics"
  ON public.neuro_fractal_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
  ON public.neuro_fractal_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for neuro_fractal_adaptations
CREATE POLICY "Users can view their own adaptations"
  ON public.neuro_fractal_adaptations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own adaptations"
  ON public.neuro_fractal_adaptations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all adaptations"
  ON public.neuro_fractal_adaptations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
