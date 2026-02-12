const Message = require('../models/message');

const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.findBySession(sessionId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMessages,
  createMessage
};
