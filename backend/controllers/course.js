const Course = require('../models/course')
const User = require('../models/user')
const CourseModule = require('../models/courseModule')
const CourseStatus = require('../models/courseStatus')
const ModuleStatus = require('../models/moduleStatus')
const CourseChapter = require('../models/courseChapter')
const ObjectId = require('mongoose').Types.ObjectId;

// demonstrates how to get a transaction status
const { providers } = require("near-api-js");
const { default: mongoose } = require('mongoose');

//network config (replace testnet with mainnet or betanet)
const provider = new providers.JsonRpcProvider(
    "https://archival-rpc.testnet.near.org"
);


// @Querying historical data (older than 5 epochs or ~2.5 days) ->  "https://archival-rpc.testnet.near.org" <Maximum number of requests per IP: 600 req/min>
// @Querying historical data (lesser than 5 epochs or ~2.5 days) ->  "https://rpc.testnet.near.org"         <Maximum number of requests per IP: 600 req/min>

// @desc    Get all courses
// @route   GET /course
// @access  Public
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
        return res.status(200).json(courses)
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error getting courses ${error}` });
    }
}


// @desc    Get Particular course detail
// @route   GET /course/:courseId
// @access  Public
const getCourseDetail = async (req, res) => {
    try {
        const courseData = await Course.findById(req.params.courseId)
            .populate({
                path: 'courseModules',
                model: 'CourseModule',
                populate: {
                    path: 'chapterIds',
                    model: 'CourseChapter'
                }
            })
        if (!courseData) return res.status(400).send({ status: false,message: "No course Found" });
        return res.status(200).send({ status: true, message: "Course Data", course: courseData });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error getting course: ${error.message}` });

    }


}

// @desc    Get Particular module detail
// @route   GET /course/:courseId/module/:moduleId
// @access  Public
const getModuleDetail = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const moduleData = await CourseModule.find({
            moduleCourseId: courseId,
            moduleNumber: moduleId
        })
        if (!moduleData) return res.status(400).send({status: false, message: "No Module Found" });
        return res.status(200).send({ status: true, message: "Module Data", module: moduleData });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error getting Module: ${error.message}` });
    }
}

// @desc    Get Particular module detail
// @route   GET /course/:courseId/module/:moduleId/chapter/:chapterId
// @access  Public
const getChapterDetail = async (req, res) => {
    try {
        const { courseId, moduleId, chapterId } = req.params;

        const moduleData = await CourseModule.findOne({
            moduleCourseId: courseId,
            moduleNumber: moduleId
        }).populate("chapterIds")

        if (!moduleData) return res.status(400).send({ message: "No Module Found" });
        const chapterData = moduleData.chapterIds.find(
            (chapter) => chapter.chapterSequence == chapterId
        );
        if (!chapterData) return res.status(400).send({ message: "No Chapter Found" });
        return res.status(200).send({ status: true, message: "Module Data", chapter: chapterData });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error getting Module: ${error.message}` });
    }
}

// @desc    Get Particular course detail
// @route   POST /course/create
// @access  Private
const createCourse = async (req, res) => {
    try {
        // const { courseTitle, courseBrief, courseFee, language, timeRequired, tags, rating, image, instructorId, courseModules, courseAssessmentIds, courseCompleted, courseApproved, }= req.body
        const { courseTitle, courseBrief, courseFee, language, timeRequired, tags, image, noOfModules } = req.body

        if (!courseTitle || !courseBrief || !courseFee || !language || !timeRequired || !tags || !image || !noOfModules)
            return res.status(400).send({ status: false, message: "Please Send Complete Detail" });

        const newCourse = new Course({
            courseTitle,
            courseBrief,
            courseFee,
            noOfModules,
            language,
            timeRequired,
            tags,
            rating: 0,
            image,
            instructorId: req.userId,
            courseModules: [],
            courseAssessmentIds: [],
            courseCompleted: false,
            courseApproved: false

        })
        await newCourse.save()
        return res.status(200).send({ status: true, message: "Course Created", courseData: newCourse });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error creatig course: ${error.message}` });
    }
}

// @desc    Add modules to Course
// @route   POST /course/addmodule
// @access  Private
const addModule = async (req, res) => {
    try {
        const { moduleTitle, moduleBrief, moduleFee, CourseId, noOfChapters, moduleNumber } = req.body

        if (!moduleTitle, !moduleBrief, !moduleFee, !CourseId, !noOfChapters, !moduleNumber)
            return res.status(400).send({ status: false, message: "Please Send Complete Detail" });
        const course = await Course.findById(CourseId)
        if (!course) return res.status(400).send({ status: false, message: "Course Not found" });
        if (course.instructorId != req.userId) return res.status(400).send({ status: false, message: "You can't modify Course, No Write Access" });
        console.log(course.instructorId);
        console.log(req.userId);
        const newModule = new CourseModule({
            moduleTitle,
            moduleBrief,
            moduleFee,
            moduleCourseId: CourseId,
            noOfChapters,
            moduleNumber
        })
        await newModule.save()
        await Course.findByIdAndUpdate(CourseId, { $push: { courseModules: newModule._id } })
        const courseData = await Course.findById(CourseId).populate("courseModules")
        return res.status(200).send({ status: true, message: "Module Added", courseData });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Adding Module: ${error.message}` });
    }
}


const searchCourses = async (req, res) => {
    try {
        console.log("in searchCourses ")
        const tags = req.query.tags;
        const courses = await Course.find({ tags: { $in: tags } });
        console.log("out searchCourses ")

        return res.send(courses);
    } catch (error) {
        return res.status(400).send({ message: 'Error searching courses' });
    }
};


// @desc    Payment confirmation and course Enrollment
// @route   GET /course/approval?transactionId
// @access  Restricted  
const coursePaymentApproval = async (req, res) => {
    console.log("called coursePaymentApproval")
    console.log("req.query.transactionId", req.query.transactionId)
    const txresponse = await provider.txStatus(req.query.transactionId, 'testnet');
    console.log(txresponse.transaction.actions[0].FunctionCall.deposit)
    // console.log(txresponse.receipts_outcome)
    console.log(txresponse.transaction.signer_id)
    // console.log(txresponse.transaction.actions)
    // console.log(txresponse.transaction_outcome)
    const function_args = JSON.parse(Buffer.from(txresponse.transaction.actions[0].FunctionCall.args, 'base64').toString('utf8'))
    console.log(Buffer.from(txresponse.status.SuccessValue, 'base64').toString('utf8'))
    console.log(Buffer.from(txresponse.transaction.actions[0].FunctionCall.args, 'base64').toString('utf8'))
    let user_account = txresponse.transaction.signer_id;
    if (function_args.gift_to) user_account = function_args.gift_to

    console.log("function_args", function_args)
    try {
        const current_time = new Date();
        const user = await User.findOne({ nearWallet: user_account })

        for (const course in function_args.courses) {
            console.log("course", course)

            const course_enrolled = await CourseStatus.findOne({ courseId: new ObjectId(course), userId: user._id }).populate("courseModulesStatus")
            console.log("course_enrolled", course_enrolled)
            console.log("in course_status")
            let module_list = []
            for (let i = 0; i < function_args.courses[course].length; i++) {
                const module_id = function_args.courses[course][i]
                console.log("before module_info", typeof module_id);
                //below line stops execution ehen chapterIds is empty 
                const module_info = await CourseModule.findOne({ moduleId: new ObjectId(module_id) })
                console.log("module_info", module_info);

                let chapter_list = []
                module_info.chapterIds.forEach(chapter => {
                    chapter_list.push({ chapterId: chapter, status: false })
                })
                console.log("chapter_list", chapter_list);
                module_list.push({
                    moduleStatusId: new ObjectId(),
                    moduleId: module_id,
                    userId: user._id,
                    chapterStatus: chapter_list,
                    enrollmentDate: current_time,
                    assessmentScore: 0,

                });
                // console.log("moduleStatusId", new ObjectId());
                // console.log("moduleId", module_id);
                // console.log("userId", user._id);
                // console.log("current_time", current_time);
            }
            console.log("module_list", module_list);

            const module_status_response = await ModuleStatus.create(module_list)
            console.log("module_status_response", module_status_response);
            let module_status_list = []
            module_status_response.forEach(module_status => {
                module_status_list.push(module_status._id)
            })
            console.log("module_status_list", module_status_list);
            console.log("course", course);
            console.log("user._id", user._id);
            if (course_enrolled) {

                const course_status = await CourseStatus.updateOne({ courseId: course, userId: user._id }, { $push: { courseModulesStatus: { $each: module_status_list } } },
                    { new: true },
                    (err, updatedCourseStatus) => {
                        if (err) {
                            console.log('Error updating CourseStatus:', err);
                        } else {
                            console.log('Updated CourseStatus:', updatedCourseStatus);
                        }
                    }
                );

            } else {


                const course_status = await CourseStatus.create({
                    courseStatusId: new ObjectId(),
                    enrollmentDate: current_time,
                    courseId: course,
                    userId: user._id,
                    courseModulesStatus: module_status_list,
                    assessmentScore: 0
                })
                console.log("course_status", course_status)

            }
        }
        res.status(200).json({ "mesage": "CourseStatus created" })
    } catch (error) {
        // handle error
    }

}

module.exports = { getCourses, getModuleDetail, getChapterDetail, addModule, searchCourses, getCourseDetail, createCourse, coursePaymentApproval }