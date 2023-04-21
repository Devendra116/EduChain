const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const courseSchema = mongoose.Schema({
    courseTitle: { type: String, required: [true, 'Please add an courseTitle'] },
    courseBrief: { type: String, required: [true, 'Please add an courseBrief'] },
    courseFee: { type: Number },
    noOfModules: { type: Number },
    language: { type: String },
    timeRequired: { type: String },
    tags: [{ type: String }],
    rating: { type: Number },
    image: { type: String },
    instructorId: { type: mongoose.Types.ObjectId, ref: 'User' },
    courseModules: [{ type: mongoose.Types.ObjectId, ref: 'CourseModule' }],
    courseAssessmentIds: [{ type: mongoose.Types.ObjectId, ref: 'CourseAssessment' }],
    courseCompleted: { type: Boolean, default: false },
    courseApproved: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = mongoose.model('Course', courseSchema)