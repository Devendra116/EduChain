const express = require('express')
const router = express.Router()
const { getCourses, addModule, addChapter, courseInProgress, getModuleStatusDetail, getCourseStatusDetail, courseCompleted, completeCourse, addAssessment, getModuleDetail, getChapterDetail, createCourse, getCourseDetail, coursePaymentApproval } = require('../controllers/course')
const { userAuth } = require('../middleware/userAuth')

router.get('/', getCourses)
router.get('/course-in-progress', userAuth, courseInProgress)
router.get('/course-completed', userAuth, courseCompleted)
router.get('/status/module/:moduleId', userAuth, getModuleStatusDetail)
router.get('/status/:courseId', userAuth, getCourseStatusDetail)
router.get('/:courseId/module/:moduleId/chapter/:chapterId', userAuth, getChapterDetail)
router.get('/:courseId/module/:moduleId', userAuth, getModuleDetail)
router.get('/:courseId', userAuth, getCourseDetail)


router.post('/create', userAuth, createCourse)
router.post('/addmodule', userAuth, addModule)
router.post('/addchapter', userAuth, addChapter)
router.post('/add-assessment', userAuth, addAssessment)
router.post('/submit', userAuth, completeCourse)
router.post('/approval', userAuth, coursePaymentApproval)

module.exports = router