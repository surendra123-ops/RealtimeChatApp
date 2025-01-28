const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/protectRoute'); // Ensure middleware is correctly imported

const { signup, login, logout, updateProfile,checkAuth } = require('../controllers/auth.controller');

// Define routes with appropriate methods
router.post('/signup', signup); // Sign up route
router.post('/login', login);   // Login route
router.post('/logout', logout); // Logout route
router.put('/update-profile', protectRoute, updateProfile); // Profile update route with authentication middleware
router.get("/check", protectRoute, checkAuth);
module.exports = router;
