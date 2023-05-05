const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const courseStatusSchema = mongoose.Schema({
    isCompleted: { type: Boolean, default: false },
    enrollmentDate: { type: Date, required: [true, 'Please add an enrollmentDate'] },
    completionDate: { type: Date },
    courseId: { type: mongoose.Types.ObjectId, ref: 'Course', required: [true, 'Please add an courseId'] },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: [true, 'Please add an userId'] },
    courseModulesStatus: [{ type: mongoose.Types.ObjectId, ref: 'ModuleStatus', required: [true, 'Please add an courseModulesStatus'] }],
    assessmentScore: { type: Number },
    certificateUrl: { type: String },
}, {
    timestamps: true
})
module.exports = mongoose.model('CourseStatus', courseStatusSchema)