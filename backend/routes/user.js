const express = require('express')
const router = express.Router()
const { userLogin, registerUser, updateUser, deleteUser } = require('../controllers/user')

router.post('/login', userLogin)
router.post('/register', registerUser)
router.put('/update/:userId', updateUser)
router.delete('/delete/:userId', deleteUser)

module.exports = router