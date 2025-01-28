const jwt = require('jsonwebtoken');

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  res.cookie('jwt', token, { httpOnly: true, secure: false });
  return token;
};

module.exports = { generateToken };
