const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.post('/', adminController.createCategory);
router.get('/', adminController.getAllCategories);


module.exports = router;