const supabase = require('../config/db');

class Session {
  static async create(data) {
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
  }

  static async findActive(userId) {
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
  }

  static async findByUser(userId) {
    const { data: sessions, error } = await supabase
      .from('neuro_fractal_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return sessions || [];
  }

  static async updateActivity(sessionId) {
    const { error } = await supabase
      .from('neuro_fractal_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  }

  static async deactivate(sessionId) {
    const { error } = await supabase
      .from('neuro_fractal_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) throw error;
  }
}

module.exports = Session;
