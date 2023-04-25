const express = require('express')
const router = express.Router()
const { getCourses, addModule, addChapter, courseInProgress,updateChapterStatus, setCourseAssessmentScore, getCourseAssessment, getModuleStatusDetail, getCourseStatusDetail, courseCompleted, completeCourse, addAssessment, getModuleDetail, getChapterDetail, createCourse, getCourseDetail, coursePaymentApproval } = require('../controllers/course')
const { userAuth } = require('../middleware/userAuth')

router.get('/', getCourses)//done
router.get('/course-in-progress', userAuth, courseInProgress)//done
router.get('/course-completed', userAuth, courseCompleted) //done
router.get('/status/module/:moduleId', userAuth, getModuleStatusDetail)
router.get('/status/:courseId', userAuth, getCourseStatusDetail)
router.get('/:courseId/module/:moduleId/chapter/:chapterId', userAuth, getChapterDetail)//done
router.get('/:courseId/module/:moduleId', userAuth, getModuleDetail) // done
router.get('/assessment/:courseId', getCourseAssessment)  //done
router.get('/:courseId', userAuth, getCourseDetail) //done


router.post('/create', userAuth, createCourse) //done
router.post('/addmodule', userAuth, addModule) // done
router.post('/addchapter', userAuth, addChapter) //done
router.post('/add-assessment', userAuth, addAssessment) //done
router.post('/submit', userAuth, completeCourse) //done
router.post('/approval', userAuth, coursePaymentApproval) //done
router.post('/assessment/:courseId', userAuth, setCourseAssessmentScore)  
router.post('/update/:courseId/module/:moduleId/chapter/:chapterId', userAuth, updateChapterStatus)

module.exports = router