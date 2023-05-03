const express = require('express')
const router = express.Router()
const { adminAuth } = require('../middleware/adminAuth')
const { adminProfile, adminLogin, registerAdmin, updateAdmin, getApprovedNgos, deleteAdmin, getApprovalPendingNgos, changeNgoStatus, deleteNgo } = require('../controllers/admin')

router.get('/profile', adminAuth, adminProfile)
router.get('/approved-ngos', adminAuth, getApprovedNgos)
router.get('/pending-ngos', adminAuth, getApprovalPendingNgos)
router.post('/change-status', adminAuth, changeNgoStatus)
router.post('/login', adminLogin)
router.post('/register', registerAdmin)
router.put('/update', adminAuth, updateAdmin)
router.delete('/delete', adminAuth, deleteAdmin)
router.delete('/delete-ngo', adminAuth, deleteNgo)

module.exports = router