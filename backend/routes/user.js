const express = require('express')
const router = express.Router()
const {userAuth} = require('../middleware/userAuth')
const {userProfile, commonLogin, registerUser, updateUser, deleteUser,verifyUser } = require('../controllers/user')

router.get('/profile',userAuth, userProfile) //done
router.post('/verify', verifyUser)
router.post('/login', commonLogin) //done
router.post('/register', registerUser) //done
router.put('/update',userAuth, updateUser) //done
router.delete('/delete/:userId', deleteUser) //not needed

module.exports = router