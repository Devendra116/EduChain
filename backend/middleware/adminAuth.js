const jwt = require("jsonwebtoken");
require('dotenv').config()

const adminAuth = async (req, res, next) => {

    const token = req.get("Authorization");
    // check for provided token
    if (!token) return res.status(403).send("No authorization token");
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.adminId) return res.status(401).send("You Don't have Admin Rights");
        req.adminId = decoded.adminId;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(401).send("Not Authorized, Token Invalid");
    }
};

module.exports = {
    adminAuth
};
