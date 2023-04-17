const express = require('express')
const router = express.Router()
const { getCourses, addModule, searchCourses, createCourse, getCourseDetail, coursePaymentApproval } = require('../controllers/course')
const { userAuth } = require('../middleware/userAuth')

router.get('/', getCourses)
router.post('/create', userAuth, createCourse)
router.post('/addmodule', userAuth, addModule)
router.get('/:courseId', userAuth, getCourseDetail)
router.get('/approval', coursePaymentApproval)

module.exports = router