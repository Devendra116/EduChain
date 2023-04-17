const express = require('express')
const router = express.Router()
const { getNgoDetail,getNgoDetails, generateToken, registerNgo, registerNgoUser, getNgoUsers, ngoAdminLogin } = require('../controllers/ngo')

router.get('/all', getNgoDetails)
router.get('/users', getNgoUsers)
router.get('/:ngoId', getNgoDetail)

router.post('/admin-login', ngoAdminLogin)
router.post('/generate-token', generateToken)
router.post('/register-user', registerNgoUser)
router.post('/register', registerNgo)

module.exports = router