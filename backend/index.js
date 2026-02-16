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

// In production we serve frontend from same origin; in dev allow Vite dev server
const corsOrigin = process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173';
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production: serve frontend build from ./client (set by Dockerfile)
if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, 'client');
    app.use(express.static(staticPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});