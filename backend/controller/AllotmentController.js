const jwt = require("jsonwebtoken");
const AllotmentModel = require("../Modules/Allotment");
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';
// Middleware for JWT verification (only for POST requests)
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ success: false, msg: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, msg: "Invalid token." });
    }
};

module.exports.getAllAllotments = async (req, res) => {
    try {
        const data = await AllotmentModel.find();
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

module.exports.getSingleAllotment = async (req, res) => {
    try {
        const { _id } = req.params;
        const data = await AllotmentModel.findById(_id);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

module.exports.createAllotment = async (req, res) => {
    verifyToken(req, res, async () => {
        const bodyData = req.body;
        try {
            const sport = new AllotmentModel(bodyData);
            await sport.save();
            res.status(200).json({ success: true, msg: "Successfully created Allotment." });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, msg: "Failed to create." });
        }
    });
};
