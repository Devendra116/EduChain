const express = require('express')
const router = express.Router()
const {userAuth} = require('../middleware/userAuth')
const {userProfile, userLogin, registerUser, updateUser, deleteUser } = require('../controllers/user')

router.get('/profile',userAuth, userProfile)
router.post('/login', userLogin)
router.post('/register', registerUser)
router.put('/update',userAuth, updateUser)
router.delete('/delete/:userId', deleteUser)

module.exports = router