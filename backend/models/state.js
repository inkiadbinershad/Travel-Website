const supabase = require('../config/db');

class State {
  static async create(data) {
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
  }

  static async findBySession(sessionId) {
    const { data: states, error } = await supabase
      .from('neuro_fractal_states')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return states || [];
  }

  static async findLatest(sessionId) {
    const { data: state, error } = await supabase
      .from('neuro_fractal_states')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return state;
  }
}

module.exports = State;
