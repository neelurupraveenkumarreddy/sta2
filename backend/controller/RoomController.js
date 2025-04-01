const jwt = require("jsonwebtoken");
const RoomModel = require("../Modules/Room");
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';
// Middleware for JWT verification (only for POST requests)
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ success: false, msg: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), jwtSecret);
        console.log(decoded)
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, msg: "Invalid token." });
    }
};

module.exports.getAllRooms = async (req, res) => {
    try {
        const data = await RoomModel.find();
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

module.exports.getSingleRoom = async (req, res) => {
    try {
        const { _id } = req.params;
        const data = await RoomModel.findById(_id);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

module.exports.createRoom = async (req, res) => {
    verifyToken(req, res, async () => {
        const bodyData = req.body;
        try {
            const room = new RoomModel(bodyData);
            await room.save();
            res.status(200).json({ success: true, msg: "Successfully created Room." });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, msg: "Failed to create." });
        }
    });
};
