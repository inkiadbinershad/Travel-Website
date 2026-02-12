const Session = require('../models/session');

const getSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Session.findByUser(userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deactivateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.deactivate(sessionId);
    res.json({ message: 'Session deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSessions,
  createSession,
  deactivateSession
};
