const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// POST: Signup external company (pending approval)
router.post('/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      companyName,
      businessLicense,
      companyRegNo,
      companyEmail,
      companyPhone,
      companyAddress
    } = req.body;

    // Basic required fields check
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      companyName,
      businessLicense,
      companyRegNo,
      companyEmail,
      companyPhone,
      companyAddress,
      role: null, // will be set later by admin
      approved: false
    });

    await newUser.save();
    res.status(201).json({ message: 'Signup successful! Awaiting admin approval.' });

  } catch (err) {
    console.error('Signup failed:', err.message);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 🛑 NEW: Block login if not approved
    if (!existingUser.approved) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token, user: existingUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});


module.exports = router;
