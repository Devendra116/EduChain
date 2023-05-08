require('dotenv').config();
const Course = require('../models/course');
const User = require('../models/user');
const NGO = require('../models/ngo');
const CourseModule = require('../models/courseModule');
const CourseStatus = require('../models/courseStatus');
const ModuleStatus = require('../models/moduleStatus');
const CourseChapter = require('../models/courseChapter');
const CourseAssessment = require('../models/courseAssessment');
const ObjectId = require('mongoose').Types.ObjectId;
const { generateCertificate } = require('../utils/nftCertificateGenerator');
const { mintNFT } = require('../controllers/nftContract');
const { addCourseToContract } = require('../controllers/contractFunction');
const nearAPI = require('near-api-js');
const { utils: { format: { formatNearAmount } } } = nearAPI;

const { providers } = require('near-api-js');
const { default: mongoose } = require('mongoose');
const courseAssessment = require('../models/courseAssessment');

//network config (replace testnet with mainnet or betanet)
const provider = new providers.JsonRpcProvider(
  'https://archival-rpc.testnet.near.org'
);

function calculateModuleCost(courseFee, noOfModules) {
  const moduleFeeInNear = courseFee / noOfModules;
  const moduleFeeInYoctoNear = nearAPI.utils.format.parseNearAmount(`${moduleFeeInNear}`);
  return moduleFeeInYoctoNear;
}
// @desc    Get all courses
// @route   GET /course
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({courseCompleted:true}).populate('instructorId');

    const courseList = courses.map((course) => ({
      _id: course._id,
      courseTitle: course.courseTitle,
      courseBrief: course.courseBrief,
      courseFee: course.courseFee,
      noOfModules: course.noOfModules,
      language: course.language,
      timeRequired: course.timeRequired,
      tags: course.tags,
      rating: course.rating,
      image: course.image,
      instructorName:
        course.instructorId.firstName + ' ' + course.instructorId.lastName,
      courseModules: course.courseModules,
      courseAssessmentIds: course.courseAssessmentIds,
      courseCompleted: course.courseCompleted,
      courseApproved: course.courseApproved,
    }));
    return res.status(200).json({ status: true, courses: courseList });
  } catch (error) {
    return res
      .status(400)
      .send({ status: false, message: `Error getting courses ${error}` });
  }
};

// @desc    Get Particular course detail
// @route   GET /course/:courseId
// @access  Public
const getCourseDetail = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'courseModules',
        model: 'CourseModule',
        populate: {
          path: 'chapterIds',
          model: 'CourseChapter',
        },
      })
      .populate({
        path: 'courseAssessmentIds',
        model: 'CourseAssessment',
      })
      .populate({
        path: 'instructorId',
        model: 'User',
      });

    const courseData = {
      _id: course._id,
      courseTitle: course.courseTitle,
      courseBrief: course.courseBrief,
      courseFee: course.courseFee,
      noOfModules: course.noOfModules,
      language: course.language,
      timeRequired: course.timeRequired,
      tags: course.tags,
      rating: course.rating,
      image: course.image,
      instructorName:
        course.instructorId.firstName + ' ' + course.instructorId.lastName,
      courseModules: course.courseModules,
      courseAssessmentIds: course.courseAssessmentIds,
      courseCompleted: course.courseCompleted,
      courseApproved: course.courseApproved,
    };
    if (!courseData)
      return res
        .status(400)
        .send({ status: false, message: 'No course Found' });
    return res
      .status(200)
      .send({ status: true, message: 'Course Data', course: courseData });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error getting course: ${error.message}`,
    });
  }
};

// @desc    Get Particular module detail
// @route   GET /course/:courseId/module/:moduleId
// @access  Public
const getModuleDetail = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const moduleData = await CourseModule.findOne({
      CourseId: courseId,
      moduleNumber: moduleId,
    });
    if (!moduleData)
      return res
        .status(400)
        .send({ status: false, message: 'No Module Found' });
    return res
      .status(200)
      .send({ status: true, message: 'Module Data', module: moduleData });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error getting Module: ${error.message}`,
    });
  }
};

// @desc    Get Particular module detail
// @route   GET /course/:courseId/module/:moduleId/chapter/:chapterId
// @access  Public
const getChapterDetail = async (req, res) => {
  try {
    const { courseId, moduleId, chapterId } = req.params;

    const moduleData = await CourseModule.findOne({
      CourseId: courseId,
      moduleNumber: moduleId,
    }).populate('chapterIds');

    if (!moduleData)
      return res.status(400).send({ message: 'No Module Found' });
    const chapterData = moduleData.chapterIds.find(
      (chapter) => chapter.chapterSequence == chapterId
    );
    if (!chapterData)
      return res.status(400).send({ message: 'No Chapter Found' });
    return res
      .status(200)
      .send({ status: true, message: 'Module Data', chapter: chapterData });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error getting Module: ${error.message}`,
    });
  }
};

// @desc    Get Particular course detail
// @route   GET /course/status/:courseId
// @access  Public
const getCourseStatusDetail = async (req, res) => {
  try {
    const courseData = await CourseStatus.findById(req.params.courseId)
      .populate({
        path: 'courseModulesStatus',
        model: 'ModuleStatus',
        populate: {
          path: 'moduleId',
          model: 'CourseModule',
        },
      })
      .populate({
        path: 'courseModulesStatus',
        model: 'ModuleStatus',
        populate: {
          path: 'chapterStatus.chapterId',
          model: 'CourseChapter',
        },
      })
      .populate({
        path: 'courseId',
        model: 'Course',
        populate: {
          path: 'courseAssessmentIds',
          model: 'CourseAssessment',
        },
      });
    const courseDataFormated = {
      courseId: courseData.courseId._id,
      courseStatus: courseData.isCompleted,
      courseTitle: courseData.courseId.courseTitle,
      assessmentScore: courseData.assessmentScore,
      certificateUrl: courseData.certificateUrl,
      assessmentList: courseData.courseId.courseAssessmentIds.map(
        (assessment) => ({
          question: assessment.question,
          optionA: assessment.optionA,
          optionB: assessment.optionB,
          optionC: assessment.optionC,
          optionD: assessment.optionD,
        })
      ),
      modules: courseData.courseModulesStatus.map((moduleStatus) => ({
        moduleNumber: moduleStatus.moduleId.moduleNumber,
        moduleTitle: moduleStatus.moduleId.moduleTitle,
        moduleStatus: moduleStatus.isCompleted,
        chapters: moduleStatus.chapterStatus.map((chapterStatus) => ({
          chapterName: chapterStatus.chapterId.chapterName,
          chapterBrief: chapterStatus.chapterId.chapterBrief,
          chapterVideoUrl: chapterStatus.chapterId.chapterVideoUrl,
          chapterSequence: chapterStatus.chapterSequence,
          chapterStatus: chapterStatus.status,
        })),
      })),
    };
    if (!courseData)
      return res
        .status(400)
        .send({ status: false, message: 'No course Found' });
    return res.status(200).send({
      status: true,
      message: 'Course Status Data',
      course: courseDataFormated,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error getting Course Status: ${error.message}`,
    });
  }
};

// @desc    Get Particular module detail
// @route   GET /course/status/module/:moduleId
// @access  Public
const getModuleStatusDetail = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const moduleData = await ModuleStatus.findOne({
      moduleId,
      userId: req.userId,
    });
    console.log(moduleData);
    if (!moduleData)
      return res
        .status(400)
        .send({ status: false, message: 'No Module Status Found' });
    return res.status(200).send({
      status: true,
      message: 'Module Status Data',
      module: moduleData,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error getting Module Status: ${error.message}`,
    });
  }
};

// @desc    Get Particular course detail
// @route   POST /course/create
// @access  Private
const createCourse = async (req, res) => {
  try {
    // const { courseTitle, courseBrief, courseFee, language, timeRequired, tags, rating, image, instructorId, courseModules, courseAssessmentIds, courseCompleted, courseApproved, }= req.body
    const {
      courseTitle,
      courseBrief,
      courseFee,
      language,
      timeRequired,
      tags,
      image,
      noOfModules,
    } = req.body;

    if (
      !courseTitle ||
      !courseBrief ||
      !courseFee ||
      !language ||
      !timeRequired ||
      !tags ||
      !image ||
      !noOfModules
    )
      return res
        .status(400)
        .send({ status: false, message: 'Please Send Complete Detail' });

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
      courseApproved: false,
      courseAssessmentScoreThreshold: 0,
    });
    await newCourse.save();
    return res
      .status(200)
      .send({ status: true, message: 'Course Created', courseData: newCourse });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error creatig course: ${error.message}`,
    });
  }
};

// @desc    Add modules to Course
// @route   POST /course/addmodule
// @access  Private
const addModule = async (req, res) => {
  try {
    const { moduleTitle, moduleBrief, CourseId, noOfChapters, moduleNumber } =
      req.body;

    if (
      !moduleTitle ||
      !moduleBrief ||
      !CourseId ||
      !noOfChapters ||
      !moduleNumber
    )
      return res
        .status(400)
        .send({ status: false, message: 'Please Send Complete Detail' });
    const course = await Course.findById(CourseId);
    if (!course)
      return res
        .status(400)
        .send({ status: false, message: 'Course Not found' });
    if (course.instructorId != req.userId)
      return res.status(400).send({
        status: false,
        message: "You can't modify Course, No Write Access",
      });
    console.log(course.instructorId);
    console.log(req.userId);
    const newModule = new CourseModule({
      moduleTitle,
      moduleBrief,
      CourseId,
      noOfChapters,
      moduleNumber,
    });
    await newModule.save();
    await Course.findByIdAndUpdate(CourseId, {
      $push: { courseModules: newModule._id },
    });
    const courseData = await Course.findById(CourseId).populate(
      'courseModules'
    );
    return res
      .status(200)
      .send({ status: true, message: 'Module Added', courseData });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Adding Module: ${error.message}`,
    });
  }
};

// @desc    Add Chapters to Module
// @route   POST /course/addchapter
// @access  Private
const addChapter = async (req, res) => {
  try {
    const {
      CourseId,
      moduleNumber,
      chapterSequence,
      chapterName,
      chapterBrief,
      chapterVideoUrl,
    } = req.body;

    if (
      !CourseId ||
      !moduleNumber ||
      !chapterSequence ||
      !chapterName ||
      !chapterBrief ||
      !chapterVideoUrl
    )
      return res
        .status(400)
        .send({ status: false, message: 'Please Send Complete Detail' });
    const module = await CourseModule.findOne({
      CourseId,
      moduleNumber,
    }).populate('chapterIds');
    if (!module)
      return res
        .status(400)
        .send({ status: false, message: 'Module Not found' });
    let chapterExists = false;
    if (module.chapterIds && module.chapterIds.length >= module.noOfChapters)
      return res.status(400).send({
        status: false,
        message: 'You have already entered all chapters for this module',
      });
    if (module.chapterIds && module.chapterIds.length !== 0) {
      module.chapterIds.forEach((chapter) => {
        if (chapter.chapterSequence == chapterSequence) chapterExists = true;
      });
    }
    if (chapterExists)
      return res
        .status(400)
        .send({ status: false, message: 'Chapter Already Exist' });
    const newChapter = new CourseChapter({
      chapterSequence,
      chapterName,
      chapterBrief,
      chapterVideoUrl,
    });
    await newChapter.save();
    await CourseModule.findByIdAndUpdate(module._id, {
      $push: { chapterIds: newChapter._id },
    });
    return res.status(200).send({ status: true, message: 'Chapter Added' });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Adding Chapter: ${error.message}`,
    });
  }
};

const searchCourses = async (req, res) => {
  try {
    const tags = req.query.tags; // extract the "tags" query parameter value
    const regex = new RegExp(tags.split(',').join('|'), 'i'); // create a case-insensitive regex
    const courses = await Course.find({ tags: { $regex: regex } }).populate({
      path: 'instructorId',
      model: 'User',
      select: 'firstName lastName',
    }); // find courses matching the regex
    const courseList = courses.map((course) => ({
      _id: course._id,
      courseTitle: course.courseTitle,
      courseBrief: course.courseBrief,
      courseFee: course.courseFee,
      noOfModules: course.noOfModules,
      language: course.language,
      timeRequired: course.timeRequired,
      tags: course.tags,
      rating: course.rating,
      image: course.image,
      instructorName:
        course.instructorId.firstName + ' ' + course.instructorId.lastName,
      courseModules: course.courseModules,
      courseAssessmentIds: course.courseAssessmentIds,
      courseCompleted: course.courseCompleted,
      courseApproved: course.courseApproved,
    }));
    return res.status(200).send({ status: true, courseList });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error searching courses ${error.message}`,
    });
  }
};

// @desc    Add Chapters to Module
// @route   POST /course/add-assessment
// @access  Private
const addAssessment = async (req, res) => {
  try {
    const { assessmentList, courseId } = req.body;
    if (assessmentList && assessmentList.length < 1)
      return res
        .status(400)
        .send({ status: false, message: 'Please Enter a Assessment' });
    if (!courseId)
      return res
        .status(400)
        .send({ status: false, message: 'Please Enter CourseId' });
    let courseDetail = await Course.findById(courseId);
    if (courseDetail.isCompleted)
      return res.status(400).send({
        status: false,
        message: 'Cannot add course once it is Completed',
      });
    const addAssessment = await CourseAssessment.insertMany(assessmentList);
    const assessmentListIds = [];
    addAssessment.forEach((assessment) => {
      assessmentListIds.push(assessment._id);
    });
    const totalAssessement =
      courseDetail.courseAssessmentIds.length + assessmentListIds.length;
    await Course.findByIdAndUpdate(courseId, {
      $push: { courseAssessmentIds: assessmentListIds },
      $set: {
        courseAssessmentScoreThreshold: Math.round(totalAssessement * 0.75),
      },
    });
    return res.status(200).send({
      status: true,
      message: 'Assessment Added',
      addAssessment,
      assessmentListIds,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Adding Assessment: ${error.message}`,
    });
  }
};

// @desc    Submit the Course to Educhain Platform for review
// @route   POST /course/submit
// @access  Private
const completeCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId)
      return res
        .status(400)
        .send({ status: false, message: 'Please Enter CourseId' });
    const course = await Course.findById(courseId)
      .populate('instructorId', 'nearWallet')
      .populate({
        path: 'courseModules',
        model: 'CourseModule',
        select: 'moduleFee',
      });
    if (!course)
      return res
        .status(400)
        .send({ status: false, message: 'Please Check CourseId' });
    const courseData = {
      course_id: course._id.toString(),
      course_title: course.courseTitle,
      instructor: course.instructorId.nearWallet,
      modules: course.courseModules.reduce((acc, module) => {
        acc[module._id.toString()] = calculateModuleCost(course.courseFee, course.noOfModules).toString();
        return acc;
      }, {})
    }
    
    console.log(courseData)
    const addCourse = await addCourseToContract(courseData)
    console.log(addCourse)

    course.courseCompleted=true
    await course.save()

    return res.status(200).send({ status: true, message: 'Course Submitted' });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Submitting Course: ${error.message}`,
    });
  }
};

// @desc    Fetch All the courses that are in-progress
// @route   GET /course/course-in-progress
// @access  Private
const courseInProgress = async (req, res) => {
  try {
    const { userId } = req;
    let courses = await CourseStatus.find({ userId, isCompleted: false })
      .populate('courseModulesStatus')
      .populate({
        path: 'courseId',
        model: 'Course',
        populate: {
          path: 'instructorId',
          model: 'User',
          select: 'firstName lastName',
        },
      });
    let courseList = courses.map((course) => {
      const instructor = course.courseId.instructorId;
      const instructorName = `${instructor.firstName} ${instructor.lastName}`;
      return { ...course.toObject(), instructorName: instructorName };
    });

    console.log(courses);
    if (!courses.length)
      return res
        .status(400)
        .send({ status: false, message: 'No In-Progress Course' });

    return res.status(200).send({
      status: true,
      message: 'In-Progress Courses',
      courseList,
      courses,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Getting In-Progress Courses: ${error.message}`,
    });
  }
};

// @desc    Fetch All the courses that are completed by user
// @route   GET /course/course-completed
// @access  Private
const courseCompleted = async (req, res) => {
  try {
    const { userId } = req;
    const courses = await CourseStatus.find({
      userId,
      isCompleted: true,
    }).populate('courseId');
    if (!courses.length)
      return res
        .status(400)
        .send({ status: false, message: 'No Completed Course' });
    let NFTExplorerLink = '';
    if (process.env.NETWORK_ID == 'testnet')
      NFTExplorerLink = `https://testnet.nearblocks.io/nft-token/${process.env.NFT_CONTRACT}/`;
    else
      NFTExplorerLink = `https://nearblocks.io/nft-token/${process.env.NFT_CONTRACT}/`;
    const courseList = courses.map((course) => ({
      _id: course._id,
      isCompleted: course.isCompleted,
      enrollmentDate: course.enrollmentDate,
      courseId: course.courseId,
      userId: course.userId,
      courseModulesStatus: course.courseModulesStatus,
      assessmentScore: course.assessmentScore,
      completionDate: course.completionDate,
      certificateUrl: course.certificateUrl,
      NFTExplorerLink: NFTExplorerLink + `${course._id}`,
    }));

    return res.status(200).send({
      status: true,
      message: 'Completed Courses',
      courses: courseList,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Getting Completed Courses: ${error.message}`,
    });
  }
};

// @desc    Fetch All the courses that are uploaded by user
// @route   GET /course/course-uploaded
// @access  Private
const courseUploaded = async (req, res) => {
  try {
    const { userId } = req;
    const uploadedCourses = await Course.find({
      instructorId: userId,
    }).populate({
      path: 'instructorId',
      model: 'User',
      select: 'firstName lastName',
    });
    if (!uploadedCourses.length)
      return res
        .status(400)
        .send({ status: false, message: 'No Course Uploaded' });

    return res.status(200).send({
      status: true,
      message: 'Uploaded Courses',
      courses: uploadedCourses,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Getting Uploaded Courses: ${error.message}`,
    });
  }
};

// @desc    Payment confirmation and course Enrollment
// @route   POST /course/approval?transactionId
// @access  Private
const coursePaymentApproval = async (req, res) => {
  const txresponse = await provider.txStatus(
    req.query.transactionId,
    process.env.NETWORK_ID
  );
  // let function_args = { "courses": { "64412ac4f2bcaf8f626b4c1b": ["1", "2"] } }

  const function_args = JSON.parse(
    Buffer.from(
      txresponse.transaction.actions[0].FunctionCall.args,
      'base64'
    ).toString('utf8')
  );
  console.log(
    Buffer.from(txresponse.status.SuccessValue, 'base64').toString('utf8')
  );
  console.log(
    Buffer.from(
      txresponse.transaction.actions[0].FunctionCall.args,
      'base64'
    ).toString('utf8')
  );

  let user_account = txresponse.transaction.signer_id;
  console.log(user_account);
  if (function_args.gift_to) user_account = function_args.gift_to;
  try {
    const current_time = new Date();
    const user = await User.findOne({ nearWallet: user_account });
    if (!user)
      return res.status(400).send({ status: false, message: 'User Not found' });
    for (let course in function_args.courses) {
      const course_enrolled = await CourseStatus.findOne({
        courseId: new ObjectId(course),
        userId: user._id,
      }).populate('courseModulesStatus');
      let module_list = [];
      for (let i = 0; i < function_args.courses[course].length; i++) {
        const module_id = function_args.courses[course][i];
        //below line stops execution when chapterIds is empty
        const module_info = await CourseModule.findOne({
          CourseId: new ObjectId(course),
          moduleNumber: Number(module_id),
        }).populate('chapterIds');
        console.log('module into', module_info);
        let chapter_list = [];
        module_info.chapterIds.forEach((chapter) => {
          // console.log("capter", chapter)
          chapter_list.push({
            chapterId: chapter._id,
            chapterSequence: chapter.chapterSequence,
            status: false,
          });
        });
        module_list.push({
          moduleId: module_info._id,
          moduleNumber: module_info.moduleNumber,
          userId: user._id,
          chapterStatus: chapter_list,
          enrollmentDate: current_time,
          assessmentScore: 0,
        });
      }

      const module_status_response = await ModuleStatus.create(module_list);
      let module_status_list = [];
      module_status_response.forEach((module_status) => {
        module_status_list.push(module_status._id);
      });
      if (course_enrolled) {
        const course_status = await CourseStatus.updateOne(
          { courseId: course, userId: user._id },
          { $push: { courseModulesStatus: { $each: module_status_list } } },
          { new: true }
        );
        if (!course_status)
          return res.status(400).send({
            status: false,
            message: `Error Updating CourseStatus: ${error.message}`,
          });

        return res
          .status(200)
          .send({ status: true, message: 'CourseStatus Updated' });
      } else {
        const course_status = await CourseStatus.create({
          enrollmentDate: current_time,
          courseId: course,
          userId: user._id,
          courseModulesStatus: module_status_list,
          assessmentScore: 0,
        });
        if (!course_status)
          return res.status(400).send({
            status: false,
            message: `Error Creating CourseStatus: ${error.message}`,
          });
        return res
          .status(200)
          .send({ status: true, message: 'CourseStatus Created' });
      }
    }
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Creating/Updating CourseStatus: ${error.message}`,
    });
  }
};

// @desc    Fetch All the asessement
// @route   GET /course/assessment/:courseId
// @access  Private
const getCourseAssessment = async (req, res) => {
  try {
    const { userId } = req;
    const { courseId } = req.params;
    const courseAssessment = await Course.findById(
      courseId,
      'courseAssessmentIds'
    ).populate({
      path: 'courseAssessmentIds',
      select:
        '-_id -__v -createdAt -updatedAt -correctOption +question +optionA +optionB +optionC +optionD',
    });
    return res.status(200).send({
      status: true,
      message: 'Course Assessment',
      courseAssessment: courseAssessment.courseAssessmentIds,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Getting Course Assessment: ${error.message}`,
    });
  }
};

// @desc    Check asessement and give score
// @route   POST /course/assessment/:courseId
// @access  Private
const setCourseAssessmentScore = async (req, res) => {
  try {
    const { userId } = req;
    const { assessmentList } = req.body;
    const { courseId } = req.params;
    const updateCourseStatus = await CourseStatus.findOne({
      courseId: courseId,
      userId,
    });
    if (updateCourseStatus.isCompleted)
      return res.status(400).send({
        status: false,
        message:
          'You cannot give Assessment again, Once the course is complted',
      });
    const courseAssessment = await Course.findById(
      courseId,
      'courseAssessmentScoreThreshold courseAssessmentIds'
    ).populate({
      path: 'courseAssessmentIds',
      select:
        '-_id -__v -createdAt -updatedAt +correctOption +question -optionA -optionB -optionC -optionD',
    });
    const matchingQuestions = assessmentList.filter((question) => {
      return courseAssessment.courseAssessmentIds.some(
        (q) =>
          q.question === question.question &&
          q.correctOption === question.correctOption
      );
    });
    const count = matchingQuestions.length;
    if (
      updateCourseStatus.assessmentScore &&
      updateCourseStatus.assessmentScore > count
    )
      return res.status(200).send({
        status: false,
        message: 'Previous Assessment Score was Higher than this',
        assessmentScore: count,
      });
    if (
      count &&
      count >= courseAssessment.courseAssessmentScoreThreshold
    ) {
      updateCourseStatus.isCompleted = true;
      updateCourseStatus.completionDate = new Date();
    }
    updateCourseStatus.assessmentScore = count;
    await updateCourseStatus.save();
    return res.status(200).send({
      status: true,
      message: 'Course Assessment Score Updated',
      assessmentScore: count,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Getting Course Assessment: ${error.message}`,
    });
  }
};

// @desc    Check asessement and give score
// @route   POST /course/update/:courseId/module/:moduleNumber/chapter/:chapterNumber
// @access  Private
const updateChapterStatus = async (req, res) => {
  try {
    const { courseId, moduleNumber, chapterNumber } = req.params;
    const { userId } = req;
    let moduleStatusIdToUpdate;
    let isModuleAlreadyComplete = false;
    const courseStatus = await CourseStatus.findOne({
      courseId,
      userId,
    }).populate('courseModulesStatus');
    if (!courseStatus)
      return res
        .status(400)
        .send({ status: false, message: 'No Course status Found' });
    console.log(courseStatus);
    courseStatus.courseModulesStatus.forEach((moduleStatus) => {
      if (moduleStatus.moduleNumber == moduleNumber) {
        moduleStatusIdToUpdate = moduleStatus._id;
        if (moduleStatus.isCompleted) isModuleAlreadyComplete = true;
      }
    });
    if (isModuleAlreadyComplete)
      return res
        .status(200)
        .send({ status: false, message: 'Module already completed' });
    if (!moduleStatusIdToUpdate)
      return res
        .status(400)
        .send({ status: false, message: 'No Module Status Found' });
    const query = {
      _id: moduleStatusIdToUpdate,
      'chapterStatus.chapterSequence': chapterNumber,
    };
    const update = {
      $set: {
        'chapterStatus.$.status': true,
      },
    };
    const options = {
      new: true, // Returns the updated document
    };
    const updateModuleStatus = await ModuleStatus.findOneAndUpdate(
      query,
      update,
      options
    );

    if (!updateModuleStatus)
      return res
        .status(400)
        .send({ status: false, message: 'Please Check Chapter Number' });
    let moduleCompleteStatus = true;
    updateModuleStatus.chapterStatus.forEach((chapter) => {
      if (chapter.status == false) moduleCompleteStatus = false;
    });
    if (!moduleCompleteStatus)
      return res
        .status(200)
        .send({ status: true, message: 'Updated Chapter status' });
    updateModuleStatus.isCompleted = true;
    await updateModuleStatus.save();
    return res
      .status(200)
      .send({ status: true, message: 'Module Completed', moduleStatus: true });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Updating Chapter status: ${error.message}`,
    });
  }
};

// @desc    generate NFT certificate
// @route   POST /course/generate-certificate/:courseId/
// @access  Private
const generateNFTCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req;
    const courseStatus = await CourseStatus.findOne(
      { userId, courseId },
      'certificateUrl'
    )
      .populate('courseModulesStatus')
      .populate('userId', 'firstName lastName nearWallet');
    console.log('courseStatus', courseStatus);
    if (!courseStatus)
      return res
        .status(400)
        .send({ status: false, message: 'No Course Status found' });
    if (courseStatus.certificateUrl)
      return res
        .status(400)
        .send({ status: false, message: 'certificate Already Generated' });
    let isCourseComplete = true;
    courseStatus.courseModulesStatus.forEach((moduleStatus) => {
      if (!moduleStatus.isCompleted) isCourseComplete = false;
    });
    if (!isCourseComplete)
      return res
        .status(400)
        .send({ status: false, message: 'First Complete Course' });

    const courseDetail = await Course.findById(
      courseId,
      'courseTitle'
    ).populate('instructorId', 'firstName lastName nearWallet');
    if (
      courseDetail.courseAssessmentScoreThreshold > courseStatus.assessmentScore
    )
      return res.status(400).send({
        status: false,
        message: 'Please Pass Assessement to Get Certificate',
      });

    courseStatus.isCompleted = true;
    courseStatus.completionDate = new Date();

    const certificateData = [
      {
        text: `${courseStatus.userId.firstName} ${courseStatus.userId.lastName}`,
        x: 500,
        y: 420,
        fontSize: 48,
        fontBold: true,
        fontColor: '#000',
        fontFamily: 'Verdana',
      },
      {
        text: 'For Completing The Online Course -',
        x: 490,
        y: 470,
        fontSize: 24,
        fontBold: false,
        fontColor: '#333',
        fontFamily: 'Verdana',
      },
      {
        text: `${courseDetail.courseTitle}`,
        x: 490,
        y: 500,
        fontSize: 28,
        fontBold: true,
        fontColor: '#111',
        fontFamily: 'Verdana',
      },
      {
        text: `${courseDetail.instructorId.nearWallet}`,
        x: 735,
        y: 600,
        fontSize: 24,
        fontBold: false,
        fontColor: '#444',
        fontFamily: 'Times New Roman',
      },
      {
        text: `${courseDetail.instructorId.firstName} ${courseDetail.instructorId.lastName}`,
        x: 730,
        y: 655,
        fontSize: 18,
        fontBold: true,
        fontColor: '#444',
        fontFamily: 'Times New Roman',
      },
      {
        text: `Completed On ${courseStatus.completionDate
          .toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          .replace(/(\d+)(?:[snrt][tdh])/, '$1')}`,
        x: 850,
        y: 18,
        fontSize: 18,
        fontBold: false,
        fontColor: '#666',
        fontFamily: 'Times New Roman',
      },
    ];
    const certificateUrl = await generateCertificate(certificateData);
    // const certificateUrl = "https://ipfs.io/ipfs/Qmbng3cbgeCbUerk6PUHsAiReDSAmzaVZfzkk1ccyvtjTa"
    const nftMetaData = {
      token_id: courseStatus._id,
      metadata: {
        title: courseDetail.courseTitle,
        description: `This certificate certifies that ${courseStatus.userId.firstName} ${courseStatus.userId.lastName} has completed the course with distinction`,
        media: certificateUrl,
        // media_hash: "xxxxxxx",
        copies: 1,
        // issued_at: "xxxxxxx",
        // expires_at: "xxxxxxx",
        // starts_at: "xxxxxxx",
        // updated_at: "xxxxxxx",
        // extra: "xxxxxxx",
        // reference: "xxxxxxx",
        // reference_hash: "xxxxxxx"
      },
      receiver_id: courseStatus.userId.nearWallet,
    };
    console.log(nftMetaData);
    const result = await mintNFT(nftMetaData);
    if (result.error)
      return res
        .status(400)
        .send({ status: false, message: 'Error creating Certificate' });
    courseStatus.certificateUrl = certificateUrl;
    await courseStatus.save();
    return res
      .status(200)
      .send({ status: true, message: 'Certificate Generated' });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Creating Certificate: ${error.message}`,
    });
  }
};

async function buyCourse(userId, courses) {
  console.log('courses', courses);
  console.log('userId', userId);
  const current_time = new Date();
  for (let course in courses) {
    console.log('course', course);
    const course_enrolled = await CourseStatus.findOne({
      courseId: new ObjectId(course),
      userId: userId,
    }).populate('courseModulesStatus');
    let module_list = [];
    for (let i = 0; i < courses[course].length; i++) {
      const module_id = courses[course][i];
      console.log('module_id', module_id);
      //below line stops execution when chapterIds is empty
      const module_info = await CourseModule.findOne({
        CourseId: new ObjectId(course),
        moduleNumber: Number(module_id),
      }).populate('chapterIds');
      console.log('module into', module_info);
      let chapter_list = [];
      module_info.chapterIds.forEach((chapter) => {
        // console.log("capter", chapter)
        chapter_list.push({
          chapterId: chapter._id,
          chapterSequence: chapter.chapterSequence,
          status: false,
        });
      });
      module_list.push({
        moduleId: module_info._id,
        moduleNumber: module_info.moduleNumber,
        userId: userId,
        chapterStatus: chapter_list,
        enrollmentDate: current_time,
        assessmentScore: 0,
      });
    }

    const module_status_response = await ModuleStatus.create(module_list);
    let module_status_list = [];
    module_status_response.forEach((module_status) => {
      module_status_list.push(module_status._id);
    });
    if (course_enrolled) {
      const course_status = await CourseStatus.updateOne(
        { courseId: course, userId: userId },
        { $push: { courseModulesStatus: { $each: module_status_list } } },
        { new: true }
      );
      if (!course_status)
        return {
          status: false,
          message: `Error Updating CourseStatus: ${error.message}`,
        };

      return { status: true, message: 'CourseStatus Updated' };
    } else {
      const course_status = await CourseStatus.create({
        enrollmentDate: current_time,
        courseId: course,
        userId: userId,
        courseModulesStatus: module_status_list,
        assessmentScore: 0,
      });
      if (!course_status)
        return {
          status: false,
          message: `Error Creating CourseStatus: ${error.message}`,
        };
      return { status: true, message: 'CourseStatus Created' };
    }
  }
}

// @desc    Payment confirmation and course Enrollment for NGO associates
// @route   POST /course/ngo-approval?transactionId
// @access  Private
const ngoCoursePaymentApproval = async (req, res) => {
  const txresponse = await provider.txStatus(
    req.query.transactionId,
    process.env.NETWORK_ID
  );
  // let function_args = { "courses": { "64412ac4f2bcaf8f626b4c1b": ["1", "2"] } }

  const function_args = JSON.parse(
    Buffer.from(
      txresponse.transaction.actions[0].FunctionCall.args,
      'base64'
    ).toString('utf8')
  );
  console.log(
    Buffer.from(txresponse.status.SuccessValue, 'base64').toString('utf8')
  );
  console.log(
    Buffer.from(
      txresponse.transaction.actions[0].FunctionCall.args,
      'base64'
    ).toString('utf8')
  );

  let user_account = txresponse.transaction.signer_id;
  console.log(user_account);
  if (function_args.gift_to) user_account = function_args.gift_to;
  try {
    const ngo = await NGO.findOne({ nearWallet: user_account });
    if (!ngo)
      return res.status(400).send({ status: false, message: 'NGO Not found' });
    if (!ngo.ngoUsersId.length)
      return res
        .status(400)
        .send({ status: false, message: 'No users to add course for' });
    ngo.ngoUsersId.forEach(async (user) => {
      const result = await buyCourse(user, function_args.courses);
      if (!result.status) return res.status(400).send(result);
    });
    return res.status(200).send({
      status: true,
      message: 'Course Approval Successful',
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      message: `Error Creating/Updating CourseStatus: ${error.message}`,
    });
  }
};
module.exports = {
  getCourses,
  getModuleDetail,
  getChapterDetail,
  addModule,
  addChapter,
  searchCourses,
  getCourseDetail,
  createCourse,
  coursePaymentApproval,
  addAssessment,
  completeCourse,
  courseInProgress,
  courseCompleted,
  getCourseStatusDetail,
  getModuleStatusDetail,
  getCourseAssessment,
  setCourseAssessmentScore,
  updateChapterStatus,
  courseUploaded,
  generateNFTCertificate,
  ngoCoursePaymentApproval,
};
