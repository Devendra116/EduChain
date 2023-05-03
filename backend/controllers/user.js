const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


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
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find the user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ status: false, message: 'Invalid credentials' });

        // Compare the passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ status: false, message: 'Invalid credentials' });

        // Generate a token
        const token = jwt.sign({ userId: user._id, userType: 'user' }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_TIME
        });
        console.log(user._id)
        // Return the token
        return res.status(200).send({ status: true, message: 'User Log In Successfull', token, userType: 'user' });
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
            password: hashedPassword
        });

        // Save the new user
        await newUser.save();

        return res.status(201).send({ status: true, message: 'User created successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error creating user ${error.message}` });
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

module.exports = { userProfile, userLogin, registerUser, updateUser, deleteUser }