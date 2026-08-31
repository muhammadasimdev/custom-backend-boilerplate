import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || name || '').trim();

    // 1. Build check conditions (Only check username if provided)
    const queryConditions = [{ email: cleanEmail }];
    if (cleanUsername) {
      queryConditions.push({ username: cleanUsername });
    }

    const existingUser = await User.findOne({ $or: queryConditions });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'citizen',
    });

    // 4. Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Handle any key name sent by frontend (email, username, or identifier)
    const rawIdentifier = email || username || identifier || '';
    const cleanIdentifier = rawIdentifier.toLowerCase().trim();

    if (!cleanIdentifier) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    // Search by email OR username (case-insensitive regex for username)
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: { $regex: new RegExp(`^${cleanIdentifier}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, missing token user ID' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};