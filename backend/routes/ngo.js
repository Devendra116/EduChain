const express = require('express')
const router = express.Router()
const { getNgoDetail, getNgoDetails, generateToken, registerNgo, registerNgoUser, getNgoUsers, verifyNgo } = require('../controllers/ngo')
const { ngoAuth } = require('../middleware/ngoAuth')

router.get('/all', getNgoDetails) // not needed
router.get('/users', ngoAuth, getNgoUsers) // done
router.get('/', ngoAuth, getNgoDetail)
router.post('/verify', verifyNgo)

router.post('/generate-token', ngoAuth, generateToken) // done
router.post('/register-user', registerNgoUser) // done
router.post('/register', registerNgo) //done

module.exports = router