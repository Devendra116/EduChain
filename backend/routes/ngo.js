const express = require('express')
const router = express.Router()
const { getNgoDetail,getNgoDetails, generateToken, registerNgo, registerNgoUser, getNgoUsers, ngoAdminLogin } = require('../controllers/ngo')
const { adminAuth } = require('../middleware/adminAuth')

router.get('/all', getNgoDetails)
router.get('/users', getNgoUsers)
router.get('/',adminAuth, getNgoDetail)

router.post('/admin-login', ngoAdminLogin)
router.post('/generate-token', generateToken)
router.post('/register-user', registerNgoUser)
router.post('/register', registerNgo)

module.exports = router