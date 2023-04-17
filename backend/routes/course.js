const express = require('express')
const router = express.Router()
const {getCourses,searchCourses,createCourse,getCourseDetail,coursePaymentApproval}=require('../controllers/course')
const {userAuth}= require('../middleware/userAuth')

router.get('/',getCourses)
router.post('/create',userAuth,createCourse)
router.get('/:courseId',getCourseDetail)
router.get('/approval',coursePaymentApproval)

module.exports = router