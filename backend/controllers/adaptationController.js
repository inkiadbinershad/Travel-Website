const Adaptation = require('../models/adaptation');

const getAdaptations = async (req, res) => {
  try {
    const { userId } = req.params;
    const adaptations = await Adaptation.findByUser(userId);
    res.json(adaptations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAdaptation = async (req, res) => {
  try {
    const adaptation = await Adaptation.create(req.body);
    res.json(adaptation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdaptation = async (req, res) => {
  try {
    const { adaptationId } = req.params;
    const { effectiveness_score } = req.body;
    await Adaptation.updateEffectiveness(adaptationId, effectiveness_score);
    res.json({ message: 'Adaptation updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAdaptations,
  createAdaptation,
  updateAdaptation
};
