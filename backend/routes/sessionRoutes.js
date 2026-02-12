const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.get('/:userId', sessionController.getSessions);
router.post('/', sessionController.createSession);
router.put('/:sessionId/deactivate', sessionController.deactivateSession);

module.exports = router;
