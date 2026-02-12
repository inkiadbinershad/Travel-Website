const supabase = require('../config/db');

class Adaptation {
  static async create(data) {
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
  }

  static async findByUser(userId) {
    const { data: adaptations, error } = await supabase
      .from('neuro_fractal_adaptations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return adaptations || [];
  }

  static async updateEffectiveness(adaptationId, score) {
    const { error } = await supabase
      .from('neuro_fractal_adaptations')
      .update({
        effectiveness_score: score,
        applied_at: new Date().toISOString()
      })
      .eq('id', adaptationId);

    if (error) throw error;
  }
}

module.exports = Adaptation;
