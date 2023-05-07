const express = require('express')
const router = express.Router()
const { adminAuth } = require('../middleware/adminAuth')
const { adminProfile, registerAdmin, updateAdmin, getApprovedNgos, deleteAdmin, getApprovalPendingNgos, changeNgoStatus, deleteNgo, users } = require('../controllers/admin')

router.get('/profile', adminAuth, adminProfile) // not needed
router.get('/users', adminAuth, users) // done
router.get('/approved-ngos', adminAuth, getApprovedNgos) //done 
router.get('/pending-ngos', adminAuth, getApprovalPendingNgos) //done
router.post('/change-status', adminAuth, changeNgoStatus) //done
router.post('/register', registerAdmin) // not needed 
router.put('/update', adminAuth, updateAdmin) // not needed
router.delete('/delete', adminAuth, deleteAdmin) // not needed
router.delete('/delete-ngo', adminAuth, deleteNgo) // done

module.exports = router