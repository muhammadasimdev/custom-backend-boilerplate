const authService = require('../services/auth.service');

const register = async (req, res) => {
  const { email, password } = req.body;
  
  // Call the service
  const user = await authService.registerUser(email, password);
  
  // Send the response
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: user
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Call the service
  const result = await authService.loginUser(email, password);
  
  // Send the token and user data back to frontend
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
};

module.exports = { register, login };