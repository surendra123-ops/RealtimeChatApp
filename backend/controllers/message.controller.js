const userModel = require('../models/user.model');
const messageModel = require('../models/message.model');
const { getReceiverSocketId, io } = require('../lib/socket');
const cloudinary = require('../lib/cloudinary');


module.exports.getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await userModel.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.json(filteredUsers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error retrieving users' });
    }
};

module.exports.getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;  // this is senderId

        const messages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.json(messages); // Assuming you want to return the messages here
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error retrieving messages' });
    }
};



module.exports.sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const myId = req.user._id;

        let imageurl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageurl = uploadResponse.secure_url;
        }

       const newMessage = new messageModel({
    senderId: myId,          // ID of the sender (probably a user _id)
    receiverId,              // ID of the receiver (another user _id)
    text,                    // Message content (text)
    image: imageurl,         // Optional image URL or path
    createdAt: new Date()    // Timestamp when the message was created
});

await newMessage.save();


        // Real-time functionality using socket.io
        // refer socket.js backend
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        res.json(newMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};