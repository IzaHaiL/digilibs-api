const express = require('express')
const router = express.Router()
const finalProjectController = require('../controllers/finalprojectController')
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  checkUserDeletedBeforeLogin,
  isAdmin,
  isProdi,
  isFakultas,
  isUserOwner,
  isMahasiswa
} = require('../middlewares/auth')
const {upload} = require('../middlewares/multer');


// private
router.post(
  '/private/create',
  authenticateToken,
  isMahasiswa,
  upload.array('files', 10), // Accept up to 10 files with 'files' as the field name
  finalProjectController.createFinalProjects
  
);


router.get('/private/', finalProjectController.getAllFinalProjects)

router.get(
  '/private/detail/:id',
  authenticateToken,
  finalProjectController.getFinalProjectsById
)

router.get(
  '/private/user/all',
  authenticateToken,
  checkBlacklist,
  isMahasiswa,
  finalProjectController.getAllFinalProjectsByUserId
)

router.delete(
  '/private/delete/:id',
  authenticateToken,
  checkBlacklist,
  isMahasiswa,
  finalProjectController.deleteFinalProjects
)

router.put(
  '/private/update/:project_id',
  authenticateToken,
  isMahasiswa,
  upload.array('files', 10), // Accept up to 10 files
  finalProjectController.updateFinalProjects
)

router.get(
  '/private/fakultas/count/',
  finalProjectController.getAllFakultasTotalCount
)

router.get(
  '/private/status/count/',
  finalProjectController.getAllFinalProjectsStatusCount
)

router.put(
  '/private/update/status/:id',
  authenticateToken,
  finalProjectController.updateStatusProject
)

//public

router.get(
  '/public/detail/:id',
  finalProjectController.getDetailProjectsPublicById
)

router.get('/public/', finalProjectController.getAllFinalProjectsPublic)

router.get('/public/search', finalProjectController.searchProjectPublic)

router.get(
  '/public/search/advanced',
  finalProjectController.advancedSearchProjectsPublic
)

router.get(
  '/public/same-title/',
  finalProjectController.getAllSameProjectPublic
)

router.get('/private/fakultas/',authenticateToken, finalProjectController.getAllFinalProjectsByFakultasName)
router.get('/private/prodi/',authenticateToken, finalProjectController.getAllFinalProjectsByProdiName)
router.get('/private/prodi/status/count',authenticateToken, finalProjectController.getFinalProjectStatusCountByProdi)
router.get('/private/total',authenticateToken, finalProjectController.getAllFinalProjectsTotal)



module.exports = router
