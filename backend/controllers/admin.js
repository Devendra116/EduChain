const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')


// @desc    Fetch admin Profile Info
// @route   GET /admin/profile
// @access  Public
const adminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.ngoId);
        if (!admin) return res.status(400).send({ status: false, message: 'No Admin found' });
        return res.status(200).send({ status: true, message: 'Admin Data', admin });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Logging In: ${error.message}` });
    }
};

// @desc    Authenticate a admin
// @route   POST /admin/login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find the user
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).send({ status: false, message: 'Invalid credentials' });

        // Compare the passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).send({ status: false, message: 'Invalid credentials' });

        // Generate a token
        const token = jwt.sign({ ngoId: admin._id, userType: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_TIME
        });
        console.log(admin._id)
        // Return the token
        return res.status(200).send({ status: true, message: 'Admin Log In Successful', token });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Logging In: ${error.message}` });
    }
};

// @desc    Register a new Admin
// @route   POST /admin/register
// @access  Public
const registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if the email already exists
        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).send({ status: false, message: 'Email already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user
        const newAdmin = new Admin({
            email,
            password: hashedPassword
        });

        // Save the new Admin
        await newAdmin.save();

        return res.status(201).send({ status: true, message: 'Admin created successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error creating Admin ${error.message}` });
    }
};

// @desc    Update a existing Admin
// @route   POST /admin/update
// @access  Private
const updateAdmin = async (req, res) => {
    const { email, nearWallet, password, firstName, lastName, profileImg, adminBio } = req.body;
    try {
        // Find the user
        const { ngoId } = req;
        const adminData = await Admin.findById(ngoId);
        if (!adminData) return res.status(404).send({ status: false, message: 'Admin not found' });

        // Update the user information
        if (email) adminData.email = email;
        if (nearWallet) adminData.nearWallet = nearWallet;
        if (firstName) adminData.firstName = firstName;
        if (lastName) adminData.lastName = lastName;
        if (profileImg) adminData.profileImg = profileImg;
        if (adminBio) adminData.adminBio = adminBio;

        // Hash the password if it was updated
        if (password) {
            const salt = await bcrypt.genSalt(10);
            adminData.password = await bcrypt.hash(password, salt);
        }

        // Save the updates
        await adminData.save();

        return res.status(200).send({ status: true, message: 'Admin Updated Successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error Updating Admin: ${error.message}` });
    }
};

// @desc    Delete a exisiting Admin
// @route   DELETE /admin/delete
// @access  Private
const deleteAdmin = async (req, res) => {
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.ngoId)
        if (!deletedAdmin) return res.status(400).send({ message: 'Error deleting, Admin Not Found' });
        return res.status(200).send({ status: true, message: 'Admin deleted successfully' });
    } catch (error) {
        return res.status(400).send({ status: false, message: `Error deleting Admin${error.message} ` });
    }
};

module.exports = { adminProfile, adminLogin, registerAdmin, updateAdmin, deleteAdmin }