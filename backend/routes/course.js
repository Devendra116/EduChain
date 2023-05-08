const express = require('express')
const router = express.Router()
const { getCourses, addModule, addChapter, searchCourses, courseInProgress, courseUploaded, generateNFTCertificate, updateChapterStatus, setCourseAssessmentScore, getCourseAssessment, getModuleStatusDetail, getCourseStatusDetail, courseCompleted, completeCourse, addAssessment, getModuleDetail, getChapterDetail, createCourse, getCourseDetail, coursePaymentApproval,ngoCoursePaymentApproval } = require('../controllers/course')
const { userAuth } = require('../middleware/userAuth')
const { ngoAuth } = require('../middleware/ngoAuth')

router.get('/', getCourses)//done
router.get('/search', searchCourses) //done
// router.get('/ngo', ngoCourse) //done
router.get('/course-in-progress', userAuth, courseInProgress)//done
router.get('/course-completed', userAuth, courseCompleted) //done
router.get('/course-uploaded', userAuth, courseUploaded) //done
router.get('/status/module/:moduleId', userAuth, getModuleStatusDetail) //done
router.get('/status/:courseId', userAuth, getCourseStatusDetail)//done
router.get('/:courseId/module/:moduleId/chapter/:chapterId', userAuth, getChapterDetail)//done
router.get('/:courseId/module/:moduleId', userAuth, getModuleDetail) // done
router.get('/assessment/:courseId', getCourseAssessment)  //done
router.get('/:courseId', getCourseDetail) //done


router.post('/create', userAuth, createCourse) //done
router.post('/addmodule', userAuth, addModule) // done
router.post('/addchapter', userAuth, addChapter) //done
router.post('/add-assessment', userAuth, addAssessment) //done
router.post('/submit', userAuth, completeCourse) //done
router.post('/approval', userAuth, coursePaymentApproval) //done
router.post('/ngo-approval',ngoAuth,ngoCoursePaymentApproval)  // add userauth 
router.post('/assessment/:courseId', userAuth, setCourseAssessmentScore)//done
router.post('/update/:courseId/module/:moduleNumber/chapter/:chapterNumber', userAuth, updateChapterStatus)//done
router.post('/generate-certificate/:courseId', userAuth, generateNFTCertificate)//done

module.exports = router