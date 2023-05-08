const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Admin = require('../models/admin')
const NGO = require("../models/ngo")
const crypto = require('crypto')
const { sendEmail } = require('../utils/sendEmail')


// @desc    Fetch User Profile Info
// @route   GET /user/profile
// @access  Public
const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(400).send({ status: false, message: 'No user found' });
        return res.status(200).send({ status: true, message: 'User Data', user });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Logging In: ${error.message}` });
    }
};

// @desc    Authenticate a user
// @route   POST /user/login
// @access  Public
const commonLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find the user
        const user = await User.findOne({ email });
        const admin = await Admin.findOne({ email });
        const ngoAdmin = await NGO.findOne({ email });

        if (user) {
            if (!user.isVerified) return res.status(400).send({ status: false, message: 'Please Verify your Email, And Login Afterwards' });

            // Compare the passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).send({ status: false, message: 'Invalid User credentials' });

            // Generate a token
            const token = jwt.sign({ userId: user._id, userType: 'user' }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE_TIME
            });

            // Return the token
            return res.status(200).send({ status: true, message: 'User Log In Successfull', token, userType: 'user' });
        } else if (admin) {
            // Compare the passwords
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) return res.status(400).send({ status: false, message: 'Invalid Admin credentials' });

            // Generate a token
            const token = jwt.sign({ adminId: admin._id, userType: 'admin' }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE_TIME
            });
            // Return the token
            return res.status(200).send({ status: true, message: 'Admin Log In Successful', token, userType: 'admin' });
        } else if (ngoAdmin) {
            // Compare the passwords
            if (!ngoAdmin.isVerified) return res.status(400).send({ status: false, message: 'Please Verify your Email, And Login Afterwards' });

            const isMatch = await bcrypt.compare(password, ngoAdmin.password);
            if (!isMatch) return res.status(400).send({ status: false, message: 'Invalid credentials' });

            if (!ngoAdmin.isApproved) return res.status(400).send({ status: false, message: 'Your Application is not Approved Yet, kindly try after some Time' });

            // Generate a token
            const token = jwt.sign({ ngoId: ngoAdmin._id, userType: 'ngoAdmin' }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE_TIME
            });

            // Return the token
            return res.status(200).send({ status: true, message: "Admin Log In Successfull", token, userType: 'ngoAdmin' });

        } else {
            return res.status(400).send({ status: false, message: 'Data Not Found' });
        }
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Logging In: ${error.message}` });
    }
};

// @desc    Register a new user
// @route   POST /user/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if the email already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).send({ status: false, message: 'Email already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user
        const newUser = new User({
            email,
            password: hashedPassword,
            verificationToken: crypto.randomBytes(64).toString('hex'),
        });

        // Save the new user
        await newUser.save();
        const subject = `Verify Your Account | EduChain`;
        const message = `
        <h1>EduChain</h1>
        <p>Hello, Thanks For Registering On Our Website.</p>
        <p>Kindly Verify Your Email ID By Clicking On This Link : </p>
        <a href = "http://localhost:3000?token=${newUser.verificationToken}">Verify Your Account</a>
        `;

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject,
            html: message,
        };
        await sendEmail(mailOptions)

        return res.status(201).send({ status: true, message: 'User created successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error creating user ${error.message}` });
    }
};


// @desc    Verify the user 
// @route   POST /user/verify
// @access  Public
const verifyUser = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.body.token });
        if (!user) return res.status(400).send({ status: false, message: 'Invalid Token' });
        user.verificationToken = null;
        user.isVerified = true;
        await user.save();
        return res.status(200).send({ status: true, message: 'User Verified' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Verifying User: ${error.message}` });
    }
};

// @desc    Update a existing user
// @route   POST /user/update
// @access  Private
const updateUser = async (req, res) => {
    const { email, nearWallet, password, firstName, lastName, organization, ngo, areaOfInterests, qualification, profileImg, userBio } = req.body;
    try {
        // Find the user
        const { userId } = req;
        const userData = await User.findById(userId);
        if (!userData) return res.status(404).send({ status: false, message: 'User not found' });

        // Update the user information
        if (email) userData.email = email;
        if (nearWallet) userData.nearWallet = nearWallet;
        if (firstName) userData.firstName = firstName;
        if (lastName) userData.lastName = lastName;
        if (organization) userData.organization = organization;
        if (ngo) userData.ngo = ngo;
        if (areaOfInterests) userData.areaOfInterests = areaOfInterests;
        if (qualification) userData.qualification = qualification;
        if (profileImg) userData.profileImg = profileImg;
        if (userBio) userData.userBio = userBio;

        // Hash the password if it was updated
        // if (password) {
        //     const salt = await bcrypt.genSalt(10);
        //     userData.password = await bcrypt.hash(password, salt);
        // }

        // Save the updates
        await userData.save();

        return res.status(200).send({ status: true, message: 'User Updated Successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Updating User: ${error.message}` });
    }
};

// @desc    Delete a exisiting user
// @route   POST /user
// @access  Private
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId)
        if (!deletedUser) return res.status(400).send({ message: 'Error deleting, User Not Found' });
        return res.status(200).send({ status: true, message: 'User deleted successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error deleting User${error.message} ` });
    }
};

module.exports = { userProfile, commonLogin, registerUser, updateUser, deleteUser, verifyUser }