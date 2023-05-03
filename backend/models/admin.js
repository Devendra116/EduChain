const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    email: { type: String, required: [true, 'Please add an email'] },
    password: { type: String, required: [true, 'Please add an password'] },
    nearWallet: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    profileImg: { type: String },
    adminBio: { type: String }
}, {
    timestamps: true
})
module.exports = mongoose.model('admin', adminSchema)
