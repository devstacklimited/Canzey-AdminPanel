const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');
const db = require('../config/database');
const User = require('../models/User');

const router = express.Router();

// JWT Secret (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'canzey_dashboard_secret_key_2024';

// ============================================
// REGISTER / SIGN UP - With Approval System
// ============================================
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt received');
    const { email, password, confirmPassword, firstName, lastName, phone, role } = req.body;
    
    console.log('📊 Registration data:', { email, firstName, lastName, phone, role });

    // Validate input
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Email, password, confirm password, first name, and last name are required'
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists using User model
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create default profile data for new user
    const profileData = {
      registration_date: new Date().toISOString(),
      account_type: 'dashboard_user',
      approval_status: 'pending'
    };

    const socialLinks = {
      linkedin: null,
      twitter: null,
      github: null,
      website: null
    };

    const preferences = {
      language: 'en',
      timezone: 'UTC',
      email_notifications: true
    };

    // Create new user using User model
    console.log('💾 Creating new dashboard user with User model...');
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'user',
      profileData,
      socialLinks,
      preferences,
      customFields: {}
    });

    console.log('✅ User created successfully with ID:', newUser.id);

    // Don't generate token for pending users
    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending approval by an administrator.',
      requiresApproval: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        display_name: newUser.display_name,
        role: newUser.role,
        status: newUser.status
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// ============================================
// LOGIN / SIGN IN - With Status Check
// ============================================
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received');
    const { email, password } = req.body;
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', !!password);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user using User model
    console.log('🔍 Looking for user with User model...');
    const user = await User.findByEmail(email);

    console.log('👤 User found:', !!user);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role, status: user.status });

    // Check password
    console.log('🔐 Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check user status
    console.log('📊 Checking user status:', user.status);
    if (user.status === 'pending') {
      console.log('⏳ User status is pending');
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval by an administrator. Please wait for approval.',
        requiresApproval: true
      });
    }

    if (user.status === 'hold') {
      console.log('🚫 User account on hold');
      return res.status(403).json({
        success: false,
        message: 'Your account is on hold. Please contact support.'
      });
    }


    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ Token generated successfully');

    // Update last login using User model
    console.log('📝 Updating last login...');
    await User.updateLastLogin(user.id, req.ip);

    const responseUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User',
      role: user.role,
      status: user.status
    };

    console.log('🎉 Login successful for user:', user.email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: responseUser
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// ============================================
// VERIFY TOKEN (Check if user is authenticated)
// ============================================
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data using User model
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'approved') {
      return res.status(401).json({ error: 'Invalid token or user not approved' });
    }

    res.json({
      user: user
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ============================================
// UPDATE PROFILE
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('📝 Profile update request for user:', decoded.userId);
    console.log('📊 Update data received:', req.body);
    
    // Extract all possible fields from request body
    const { 
      first_name, last_name, phone, location, bio, website, 
      company, job_title, social_links, custom_fields, ...additionalData 
    } = req.body;
    
    // Create display name from first and last name
    const display_name = [first_name, last_name].filter(Boolean).join(' ') || null;

    // Get existing user data using User model
    const existingUser = await User.findById(decoded.userId);
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Merge existing data with new data
    const updatedProfileData = {
      ...existingUser.profile_data,
      ...additionalData,
      last_updated: new Date().toISOString()
    };

    const updatedSocialLinks = {
      ...existingUser.social_links,
      ...social_links
    };

    const updatedCustomFields = {
      ...existingUser.custom_fields,
      ...custom_fields
    };

    console.log('🔄 Updating user profile with User model');

    // Update user profile using User model
    const updatedUser = await User.updateProfile(decoded.userId, {
      first_name, last_name, phone, location, bio, website, 
      company, job_title,
      social_links: updatedSocialLinks,
      custom_fields: updatedCustomFields,
      profile_data: updatedProfileData
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: error.message
    });
  }
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', (req, res) => {
  // With JWT, logout is handled on the client side by removing the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
