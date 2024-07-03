const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const {
    authenticateToken,
    authenticateRefreshToken,
    checkBlacklist,
    checkUserDeletedBeforeLogin,
    isAdmin,
    isProdi,
    isFakultas,
    isDosen,
    isMahasiswa,
  } = require("../middlewares/auth");

// Create a new research
router.post('/create' ,authenticateToken, isMahasiswa, researchController.createResearch);

// Get all research
router.get('/', researchController.getAllResearch);

// Get a single research by ID
router.get('/:id', researchController.getResearchById);

// Update a research by ID
router.put('/update/:id', researchController.updateResearch);

// Delete a research by ID
router.delete('/delete/:id', researchController.deleteResearch);

router.put('/validated/:id', researchController.validatedResearch);

module.exports = router;
