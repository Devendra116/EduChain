const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const userSchema = mongoose.Schema({
    email: { type: String, required: [true, 'Please add an email'] },
    password: { type: String, required: [true, 'Please add an password'] },
    nearWallet: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    organization: { type: String },
    ngo: { type: String },
    areaOfInterests: [{ type: String }],
    userCreatedCourses: [{ type: mongoose.Types.ObjectId, ref: 'Course' }],
    qualification: { type: String },
    profileImg: { type: String },
    userBio: { type: String }
}, {
    timestamps: true
})
module.exports = mongoose.model('User', userSchema)
