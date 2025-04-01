const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../Modules/Admin'); // Adjust path if needed

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret'; // Use an env variable for production

// Middleware for JWT verification (for registering new admins)
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

// Register a new admin user (only for authenticated admins)
module.exports.registerAdmin = async (req, res) => {
    verifyToken(req, res, async () => {
        try {
            const { username, password } = req.body;

            // Validate required fields
            if (!username || !password) {
                return res.status(400).json({ success: false, msg: 'Username and password are required.' });
            }

            // Check if the admin already exists
            const existingAdmin = await Admin.findOne({ username });
            if (existingAdmin) {
                return res.status(400).json({ success: false, msg: 'Admin already exists.' });
            }

            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create a new admin document
            const admin = new Admin({ username, password: hashedPassword });
            await admin.save();

            return res.status(201).json({ success: true, msg: 'Admin registered successfully.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, msg: 'Server error.' });
        }
    });
};

// Login an existing admin user and generate a JWT token
module.exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ success: false, msg: 'Username and password are required.' });
        }

        // Find the admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ success: false, msg: 'Invalid username or password.' });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: 'Invalid username or password.' });
        }

        // Create a payload for the token. Adjust as needed.
        const payload = {
            id: admin._id,
            username: admin.username
        };

        // Generate a JWT token with an expiration (e.g., 1 hour)
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        return res.status(200).json({ success: true, msg: 'Logged in successfully.', token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server error.' });
    }
};
