const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../lib/utils');
const cloudinary = require("../lib/cloudinary");

module.exports.signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).send('Please enter all fields');
        }
        if (password.length < 6) {
            return res.status(400).send('Password must be at least 6 characters long');
        }

        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            fullName,
            email,
            password: hashedPassword,
        });
        if (newUser) {
            await newUser.save(); // Ensure the user is saved before generating a token
            generateToken(newUser._id, res);
            return res.status(201).send('User created successfully');
        } else {
            return res.status(400).send('Error creating user');
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }
        generateToken(user._id, res);
        return res.status(200).send('User logged in successfully');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};

module.exports.logout = (req, res) => {
    try {
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) }); // Clear cookie properly
        return res.status(200).send('User logged out successfully');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id; // Ensure `req.user` is populated via middleware

        if (!profilePic) {
            return res.status(400).send('Please enter all fields');
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic); // Upload to Cloudinary
        const user = await userModel.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true } // Return updated document
        );

        if (user) {
            return res.status(200).json({ message: 'Profile updated successfully', user });
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};


module.exports.checkAuth = (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


