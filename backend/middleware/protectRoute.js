const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await userModel.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user; // Attach the user object to the request for future use
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { protectRoute };
