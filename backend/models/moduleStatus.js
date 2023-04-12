const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const moduleStatusSchema = mongoose.Schema({
    moduleId: { type: mongoose.Types.ObjectId, required: [true, 'Please add an moduleId'] },
    userId: { type: mongoose.Types.ObjectId, required: [true, 'Please add an userId'] },
    chapterStatus: [{ chapterId: String, status: String }],
    enrollmentDate: { type: Date, required: [true, 'Please add an enrollmentDate'] },
    completionDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    assessmentScore: { type: Number },
}, {
    timestamps: true
})
module.exports = mongoose.model('ModuleStatus', moduleStatusSchema)