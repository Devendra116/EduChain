const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const ModuleSchema = mongoose.Schema({
    moduleTitle: { type: String, required: [true, 'Please add an moduleTitle'] },
    moduleNumber:{type:Number, required: [true, 'Please add an moduleNumber']},
    moduleBrief: { type: String, required: [true, 'Please add an moduleBrief'] },
    moduleFee: { type: Number },
    noOfChapters: { type: Number },
    moduleCourseId: { type: mongoose.Types.ObjectId, ref: 'Course' },
    chapterIds: [{ type: mongoose.Types.ObjectId, ref: 'CourseChapter' }],
    moduleAssessmentIds: [{ type: mongoose.Types.ObjectId, ref: 'CourseAssessment' }]
}, {
    timestamps: true
})
module.exports = mongoose.model('CourseModule', ModuleSchema)
