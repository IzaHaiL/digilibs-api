    const express = require('express')
    const router = express.Router()
    const cosineSimController = require('../controllers/cosineSimController')

    router.post('/similarity', cosineSimController.getSimilarity);

    module.exports = router;