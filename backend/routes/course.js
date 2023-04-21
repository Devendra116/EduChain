const express = require('express')
const router = express.Router()
const { getCourses, addModule, addChapter, addAssessment, getModuleDetail, getChapterDetail, createCourse, getCourseDetail, coursePaymentApproval } = require('../controllers/course')
const { userAuth } = require('../middleware/userAuth')

router.get('/', getCourses)
router.get('/:courseId/module/:moduleId/chapter/:chapterId', userAuth, getChapterDetail)
router.get('/:courseId/module/:moduleId', userAuth, getModuleDetail)
router.get('/:courseId', userAuth, getCourseDetail)

router.post('/create', userAuth, createCourse)
router.post('/addmodule', userAuth, addModule)
router.post('/addchapter', userAuth, addChapter)
router.post('/add-assessment', userAuth, addAssessment)

// router.get('/approval', coursePaymentApproval)

module.exports = router