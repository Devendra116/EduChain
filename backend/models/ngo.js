const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const ngoSchema = mongoose.Schema({
    email: { type: String, required: [true, 'Please add an email'] },
    name: { type: String, required: true },
    password: { type: String, required: [true, 'Please add an password'] },
    phone: { type: Number },
    location: { type: String },
    documentUrl: { type: String },
    ngoUsersId: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    ngoCourseEnrolled: [{ type: mongoose.Types.ObjectId, ref: 'Course' }],
    nearWallet: { type: String },
    secretCode: { type: String },
    maxUserCount: { type: Number },
    joinedUserCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String }
}, {
    timestamps: true
})
module.exports = mongoose.model('NGO', ngoSchema)
