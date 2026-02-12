const supabase = require('../config/db');

class Message {
  static async create(data) {
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
  }

  static async findBySession(sessionId) {
    const { data: messages, error } = await supabase
      .from('neuro_fractal_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages || [];
  }
}

module.exports = Message;
