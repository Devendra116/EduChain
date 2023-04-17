const mongoose = require('mongoose')

const courseChapterSchema = mongoose.Schema({
    chapterSequence: { type: Number, required: [true, 'Please add an chapterSequence'] },
    chapterName: { type: String, required: [true, 'Please add an chapterName'] },
    chapterBrief: { type: String, required: [true, 'Please add an chapterBrief'] },
    chapterVideoUrl: { type: String, required: [true, 'Please add an chapterVideoUrl'] },
    // timeRequired: { type: Number, required: [true, 'Please add an timeRequired'] },
}, {
    timestamps: true
})
module.exports = mongoose.model('CourseChapter', courseChapterSchema)
