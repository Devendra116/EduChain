const NgoModel = require("../models/ngo")
const UserModel = require("../models/user")
const jwt = require('jsonwebtoken')
const v4 = require("uuid").v4
const bcrypt = require('bcryptjs')



// @desc    Authenticate a NGO Admin
// @route   POST /ngo/admin-login
// @access  Public
const ngoAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        // Find the NGO admin 
        const ngoAdmin = await NgoModel.findOne({ email });
        if (!ngoAdmin) return res.status(400).send({ message: 'Invalid credentials' });

        // Compare the passwords
        const isMatch = await bcrypt.compare(password, ngoAdmin.password);
        if (!isMatch) return res.status(400).send({ message: 'Invalid credentials' });

        // Generate a token
        const token = jwt.sign({ adminId: ngoAdmin._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Return the token
        return res.status(200).send({ message: "Admin Log In Successfull", token });
    } catch (error) {
        return res.status(400).send({ message: `Error logging in ${error} ` });
    }
};

// @desc    Register a new NGO
// @route   POST /ngo/register
// @access  Public
const registerNgo = async (req, res) => {
    try {
        const { email, password, name, phone, location } = req.body

        let ngo = await NgoModel.findOne({ email });
        if (ngo) return res.status(400).send({ message: 'NGO already exists for given Email' });

        // Create the NGO
        const newNgo = new NgoModel({
            email,
            name,
            phone,
            location,
            ngo_user_id: [],
            courseEnrolled: [],
            joinedUserCount: 0
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        newNgo.password = await bcrypt.hash(password, salt);

        await newNgo.save();

        return res.status(201).send({ message: 'NGO created successfully' });
    } catch (error) {
        return res.status(400).send({ message: `Error creating NGO ${error}` });
    }
};

// @desc    Get NGO details
// @route   GET /ngo/:ngoId
// @access  Private
const getNgoDetail = async (req, res) => {
    try {
        const ngo = await NgoModel.findById(req.params.ngoId)
        res.status(200).json(ngo)
    } catch (error) {
        res.status(400).send({ message: `Error getting NGO detail ${error}` });
    }
}

// @desc    Get NGOs details
// @route   GET /ngo/all
// @access  Private
const getNgoDetails = async (req, res) => {
    try {
        const ngo = await NgoModel.find({})
        return res.status(200).json(ngo)
    } catch (error) {
        return res.status(400).send({ message: `Error getting NGOs detail ${error}` });
    }
}

// @desc    Generate Token for NGO student registration 
// @route   POST /ngo/generate-token
// @access  Private
const generateToken = async (req, res) => {
    try {
        const { ngoId } = req.body;
        const uuidToken = v4();
        const ngo = await NgoModel.findById(ngoId)
        console.log(ngo)
        console.log(ngo.secretCode)

        if (ngo.secretCode) {
            console.log("ngo.secretCode", ngo.secretCode)
            return res.status(400).json({ "message": "Token Already Exist" })
        }
        if (0 < req.body.maxUserCount <= 50) {
            return res.status(400).json({ "message": "maxUserCount should be greater than 0 and less than 50" })
        }
        const query = { _id: req.body.ngoId };
        const update = {
            $set: {
                secretCode: uuidToken,
                maxUserCount: req.body.maxUserCount
            }
        }
        await NgoModel.findOneAndUpdate(query, update)

        res.status(200).json({ "message": `Secret code generated `, "code": uuidToken })
    } catch (error) {
        res.status(400).send({ message: `Error getting NGO detail ${error.message}` });
    }
}



// @desc    Register a new NGO user
// @route   POST /ngo/register-user
// @access  Public
const registerNgoUser = async (req, res) => {
    try {
        const { email, secretCode, password } = req.body;

        let user = await UserModel.findOne({ email });
        if (user) return res.status(400).send({ message: 'User already exists for given Email' });

        if (!secretCode) return res.status(400).send({ message: 'Enter the Secret code to join as NGO associate User' });

        const ngo = await NgoModel.findOne({ secretCode })
        if (!ngo) return res.status(400).send({ message: "No NGO found" });
        if (ngo.maxUserCount <= ngo.joinedUserCount) return res.status(400).send({ message: 'The Code has reached its Limit, Please Contact NGO admin' });

        const createNgoUser = new UserModel({
            email,
            ngo: ngo._id
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        createNgoUser.password = await bcrypt.hash(password, salt);

        await createNgoUser.save();
        await NgoModel.findOneAndUpdate({ ngo }, { $inc: { joinedUserCount: 1 }, $push: { ngoUsersId: createNgoUser._id } })

        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).send({ message: `Error creating User ${error}` });
    }
};

// @desc    Get All user for respective NGO
// @route   GET /ngo/users
// @access  Private
const getNgoUsers = async (req, res) => {
    try {
        const { ngoId } = req.body;
        console.log("req", ngoId)
        const ngoUsers = await NgoModel.findOne({ ngoId }).populate("ngoUsersId")
        res.status(200).json(ngoUsers)
    } catch (error) {
        res.status(400).send({ message: `Error getting NGO Users ${error}` });
    }
}

module.exports = { getNgoDetail, getNgoDetails, generateToken, registerNgo, registerNgoUser, getNgoUsers, ngoAdminLogin }