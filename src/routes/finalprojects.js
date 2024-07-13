const express = require('express');
const router = express.Router();
const finalProjectController = require('../controllers/finalprojectController');
const {
    authenticateToken,
    authenticateRefreshToken,
    checkBlacklist,
    checkUserDeletedBeforeLogin,
    isAdmin,
    isProdi,
    isFakultas,
    isUserOwner,
    isMahasiswa,
  } = require("../middlewares/auth");

// Create a new final project
router.post('/private/create', authenticateToken , checkBlacklist, isMahasiswa, finalProjectController.createFinalProjects);

router.get('/private/', finalProjectController.getAllFinalProjects);

router.get('/private/user/detail/:id', authenticateToken , checkBlacklist, finalProjectController.getFinalProjectsById);

router.get('/private/user/all', authenticateToken , checkBlacklist, isMahasiswa, finalProjectController.getAllFinalProjectsByUserId);

router.get('/public/detail/:id', finalProjectController.getDetailProjectsPublicById);

router.get('/public/', finalProjectController.getAllFinalProjectsPublic);

router.get('/public/search', finalProjectController.searchProjectPublic);

router.get('/public/search/advanced', finalProjectController.advancedSearchProjectsPublic);

router.get('/public/same-title/', finalProjectController.getAllSameProjectPublic);

router.delete('/private/:id', authenticateToken , checkBlacklist,isMahasiswa, finalProjectController.deleteFinalProjects);

router.put('/private/update/:id',authenticateToken, finalProjectController.updateFinalProjects);

router.get('/private/fakultas/count/', finalProjectController.getAllFakultasTotalCount);
router.get('/private/status/count/', finalProjectController.getAllFinalProjectsStatusCount);

router.put('/private/update/status/:id', authenticateToken, finalProjectController.updateStatusProject );









module.exports = router;
