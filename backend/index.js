const express = require('express');
const path = require('path');
const { io, app, server } = require('./lib/socket');

const authRoutes = require('./routes/auth.route');
const messageRoutes = require('./routes/message.route');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./lib/db');
connectDB();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

// Remove this line because __dirname is already available in CommonJS:
// const __dirname = path.resolve();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '../frontend/chatapp/dist');
    app.use(express.static(staticPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });
}


server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
