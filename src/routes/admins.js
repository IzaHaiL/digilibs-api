const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.post('/', adminController.createCategory);
router.get('/', adminController.getAllCategories);
router.post('/generate-accounts', adminController.generateAccounts);
router.post('/generate-mahasiswa-accounts', adminController.generateMahasiswaAccounts);
router.post('/generate-dosen-accounts', adminController.generateDosenAccounts);
router.post('/generate-final-projects', adminController.generateFinalProjects);
router.post('/generate-research', adminController.generateResearch);





module.exports = router;