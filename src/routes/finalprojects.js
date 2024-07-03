const express = require('express');
const router = express.Router();
const finalProjectController = require('../controllers/finalprojectController');

// Create a new final project
router.post('/', finalProjectController.createFinalProject);

// Get all final projects
router.get('/', finalProjectController.getAllFinalProjects);

// Get a single final project by ID
router.get('/:id', finalProjectController.getFinalProjectById);

// Update a final project by ID
router.put('/:id', finalProjectController.updateFinalProject);

// Delete a final project by ID
router.delete('/:id', finalProjectController.deleteFinalProject);

module.exports = router;
