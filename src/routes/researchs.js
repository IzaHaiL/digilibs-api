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
const {upload} = require('../middlewares/multer');

// Create a new research
router.post(
  '/private/create',
  authenticateToken,
  checkBlacklist,
  isDosen,
  upload.array('files', 10),
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
  '/private/delete/:id',
  authenticateToken,
  isDosen,
  researchController.deleteResearch
)

router.put(
  '/private/update/:research_id',
  authenticateToken,
  upload.array('files', 10),
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


router.get('/private/fakultas/',authenticateToken, researchController.getAllResearchByFakultasName)
router.get('/private/prodi/',authenticateToken, researchController.getAllResearchByProdiName)
router.get('/private/prodi/status/count',authenticateToken, researchController.getResearchStatusCountByProdi)
router.get('/private/total',authenticateToken, researchController.getAllResearchsTotal)

module.exports = router
