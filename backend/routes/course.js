const express = require('express')
const router = express.Router()
const { getCourses, addModule, getModuleDetail, getChapterDetail, createCourse, getCourseDetail, coursePaymentApproval } = require('../controllers/course')
const { userAuth } = require('../middleware/userAuth')

router.get('/', getCourses)
router.post('/create', userAuth, createCourse)
router.post('/addmodule', userAuth, addModule)
router.get('/module/:moduleId', userAuth, getModuleDetail)
router.get('/chapter/:chapterId', userAuth, getChapterDetail)
router.get('/:courseId', userAuth, getCourseDetail)
router.get('/approval', coursePaymentApproval)

module.exports = router