const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  checkUserDeletedBeforeLogin,
  isAdmin,
  isProdi,
  isFakultas
} = require('../middlewares/auth')

router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)
router.post(
  '/signout',
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  userController.signOut
)

router.post(
  '/create/mahasiswa',
  authenticateToken,
  isAdmin,
  userController.createMahasiswa
)
router.post(
  '/create/dosen',
  authenticateToken,
  isAdmin,
  userController.createDosen
)
router.post(
  '/create/prodi',
  authenticateToken,
  isAdmin,
  userController.createProdi
)
router.post(
  '/create/fakultas',
  authenticateToken,
  isAdmin,
  userController.createFakultas
)
router.post(
  '/create/lppm',
  authenticateToken,
  isAdmin,
  userController.createLPPM
)

// Rute dengan awalan /users/prodi/create
router.post(
  '/prodi/create/dosen',
  authenticateToken,
  isProdi,
  userController.createDosen
)
router.post(
  '/prodi/create/mahasiswa',
  authenticateToken,
  isProdi,
  userController.createMahasiswa
)

// Rute dengan awalan /users/fakultas/create
router.post(
  '/fakultas/create/prodi',
  authenticateToken,
  isFakultas,
  userController.createProdi
)
router.post(
  '/fakultas/create/dosen',
  authenticateToken,
  isFakultas,
  userController.createDosen
)
router.post(
  '/fakultas/create/mahasiswa',
  authenticateToken,
  isFakultas,
  userController.createMahasiswa
)

// Rute dengan awalan /users/admin/create
router.post(
  '/admin/create',
  authenticateToken,
  isAdmin,
  userController.createAdmin
)

// Rute untuk mengambil daftar users
router.get('/', authenticateToken, userController.getUsers)
router.get('/detail/', authenticateToken, userController.getUserById)
router.get('/count', authenticateToken, isAdmin, userController.getUserCount)

router.get(
  '/AllFakultas',
  authenticateToken,
  isAdmin,
  userController.getAllFakultas
)
router.get('/AllProdi', authenticateToken, isAdmin, userController.getAllProdi)
router.get(
  '/AllMahasiswa',
  authenticateToken,
  isAdmin,
  userController.getAllMahasiswa
)
router.get('/AllDosen', authenticateToken, isAdmin, userController.getAllDosen)
router.get(
  '/AllMahasiswaByProdi/:nama_prodi',
  authenticateToken,
  isAdmin,
  userController.getAllMahasiswaByProdi
)
router.get(
  '/AllDosenByProdi/:nama_prodi',
  authenticateToken,
  isAdmin,
  userController.getAllDosenByProdi
)
router.get(
  '/AllMahasiswaByFakultas/:nama_fakultas',
  authenticateToken,
  isAdmin,
  userController.getAllMahasiswaByFakultas
)
router.get(
  '/AllDosenByFakultas/:nama_fakultas',
  authenticateToken,
  isAdmin,
  userController.getAllDosenByFakultas
)

router.put(
  '/update/mahasiswa',
  authenticateToken,
  userController.updateUserMahasiswa
)
router.put('/update/dosen', authenticateToken, userController.updateUserDosen)
router.put('/update/prodi', authenticateToken, userController.updateUserProdi)
router.put(
  '/update/fakultas',
  authenticateToken,
  userController.updateUserFakultas
)

router.delete(
  '/delete/:id',
  authenticateToken,
  isAdmin,
  userController.deleteUser
)

module.exports = router
