const express = require('express')
const router = express.Router()
const { adminAuth } = require('../middleware/adminAuth')
const { adminProfile, adminLogin, registerAdmin, updateAdmin, deleteAdmin } = require('../controllers/admin')

router.get('/profile', adminAuth, adminProfile)
router.post('/login', adminLogin)
router.post('/register', registerAdmin)
router.put('/update', adminAuth, updateAdmin)
router.delete('/delete', adminAuth, deleteAdmin)

module.exports = router