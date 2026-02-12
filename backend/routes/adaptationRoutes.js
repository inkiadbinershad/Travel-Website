const express = require('express');
const router = express.Router();
const adaptationController = require('../controllers/adaptationController');

router.get('/:userId', adaptationController.getAdaptations);
router.post('/', adaptationController.createAdaptation);
router.put('/:adaptationId', adaptationController.updateAdaptation);

module.exports = router;
