const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


// @desc    Authenticate a user
// @route   POST /user/login
// @access  Public
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find the user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ message: 'Invalid credentials' });

        // Compare the passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ message: 'Invalid credentials' });

        // Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        console.log(user._id)
        // Return the token
        return res.status(200).send({ message: 'User Log In Successfull', token });
    } catch (error) {
        return res.status(400).send({ message: `Error Logging In: ${error.message}` });
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
        if (user) return res.status(400).send({ message: 'Email already exists' });

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

        return res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        return res.status(400).send({ message: `Error creating user ${error.message}` });
    }
};

// @desc    Update a existing user
// @route   POST /user/update/:userId
// @access  Private
const updateUser = async (req, res) => {
    const { email, nearWallet, password, firstName, lastName, organization, ngo, areaOfInterests, qualification, profileImg, userBio } = req.body;
    try {
        // Find the user
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).send({ message: 'User not found' });

        // Update the user information
        if (email) user.email = email;
        if (nearWallet) user.nearWallet = nearWallet;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (organization) user.organization = organization;
        if (ngo) user.ngo = ngo;
        if (areaOfInterests) user.areaOfInterests = areaOfInterests;
        if (qualification) user.qualification = qualification;
        if (profileImg) user.profileImg = profileImg;
        if (userBio) user.userBio = userBio;

        // Hash the password if it was updated
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        // Save the updates
        await user.save();

        return res.status(200).send({ message: 'User Updated Successfully' });
    } catch (error) {
        return res.status(400).send({ message: `Error Updating User: ${error.message}` });
    }
};

// @desc    Delete a exisiting user
// @route   POST /user
// @access  Private
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId)
        if (!deletedUser) return res.status(400).send({ message: 'Error deleting, User Not Found' });
        return res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(400).send({ message: `Error deleting User${error.message} ` });
    }
};

module.exports = { userLogin, registerUser, updateUser, deleteUser }