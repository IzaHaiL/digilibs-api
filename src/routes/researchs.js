const express = require('express')
const router = express.Router()
const researchController = require('../controllers/researchController')
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  checkUserDeletedBeforeLogin,
  isAdmin,
  isProdi,
  isFakultas,
  isDosen,
  isUserOwner,
  isMahasiswa
} = require('../middlewares/auth')

// Create a new research
router.post(
  '/private/create',
  authenticateToken,
  checkBlacklist,
  isDosen,
  researchController.createResearch
)

router.get('/private/', researchController.getAllResearch)

router.get(
  '/private/detail/:id',
  authenticateToken,
  checkBlacklist,
  researchController.getResearchById
)

router.get(
  '/private/user/all',
  authenticateToken,
  checkBlacklist,
  isDosen,
  isUserOwner,
  researchController.getAllResearchByUserId
)

router.delete(
  '/private/:id',
  authenticateToken,
  checkBlacklist,
  isUserOwner,
  isMahasiswa,
  researchController.deleteResearch
)

router.put(
  '/private/update/:id',
  authenticateToken,
  researchController.updateResearch
)

router.put(
  '/private/validated/:id',
  authenticateToken,
  researchController.updateResearch
)

router.get(
  '/private/fakultas/count/',
  researchController.getAllFakultasTotalCount
)

router.get(
  '/private/status/count/',
  researchController.getAllResearchStatusCount
)

router.put(
  '/private/update/status/:id',
  authenticateToken,
  researchController.updateStatusProject
)

router.get('/public/', researchController.getAllResearchPublic)

router.get('/public/detail/:id', researchController.getDetailProjectsPublicById)

module.exports = router
