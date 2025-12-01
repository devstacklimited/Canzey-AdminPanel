import admin from '../config/firebase.js';
import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'canzey_dashboard_secret_key_2024_change_this_in_production';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email
 */
async function sendVerificationEmail(email, verificationLink) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Canzey Account',
      html: `
        <h2>Welcome to Canzey!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL] Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ [EMAIL] Error sending verification email:', error.message);
    return false;
  }
}

/**
 * Firebase Customer Sign Up
 * Creates Firebase account and stores customer in MySQL
 */
export async function firebaseCustomerSignUp(userData) {
  try {
    console.log('📝 [FIREBASE SIGNUP] Request received');
    console.log('   📊 User data:', { email: userData.email, first_name: userData.first_name, last_name: userData.last_name });

    const { email, password, first_name, last_name, phone_number, date_of_birth, gender } = userData;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return { success: false, error: 'Email, password, first name, and last name are required' };
    }

    // Check if customer already exists in MySQL
    const connection = await pool.getConnection();
    const [existingCustomers] = await connection.execute(
      'SELECT id FROM customers WHERE email = ?',
      [email]
    );

    if (existingCustomers.length > 0) {
      connection.release();
      return { success: false, error: 'Email already registered' };
    }

    // Create Firebase user
    console.log('🔥 [FIREBASE SIGNUP] Creating Firebase user...');
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: `${first_name} ${last_name}`,
      });
      console.log('✅ [FIREBASE SIGNUP] Firebase user created:', firebaseUser.uid);

      // Send verification email
      console.log('📧 [FIREBASE SIGNUP] Sending verification email...');
      try {
        const verificationLink = await admin.auth().generateEmailVerificationLink(email);
        console.log('✅ [FIREBASE SIGNUP] Verification link generated');
        await sendVerificationEmail(email, verificationLink);
      } catch (emailError) {
        console.warn('⚠️  [FIREBASE SIGNUP] Could not send verification email:', emailError.message);
      }
    } catch (firebaseError) {
      connection.release();
      console.error('❌ [FIREBASE SIGNUP] Firebase error:', firebaseError.message);
      return { success: false, error: `Firebase error: ${firebaseError.message}` };
    }

    // Store customer in MySQL with Firebase UID
    console.log('💾 [FIREBASE SIGNUP] Storing customer in MySQL...');
    const [result] = await connection.execute(
      `INSERT INTO customers 
       (first_name, last_name, email, phone_number, date_of_birth, gender, firebase_uid, firebase_email, auth_method, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number || null, date_of_birth || null, gender || null, firebaseUser.uid, email, 'firebase', 'active']
    );

    connection.release();

    console.log('✅ [FIREBASE SIGNUP] Customer created successfully');
    console.log('   Customer ID:', result.insertId);

    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: result.insertId,
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        gender,
        firebase_uid: firebaseUser.uid,
        status: 'active',
      },
    };
  } catch (error) {
    console.error('❌ [FIREBASE SIGNUP] Error:', error.message);
    return { success: false, error: 'Server error during sign up' };
  }
}

/**
 * Firebase Customer Sign In
 * Verifies Firebase token and returns customer data
 */
export async function firebaseCustomerSignIn(firebaseToken) {
  try {
    console.log('📝 [FIREBASE SIGNIN] Request received');

    if (!firebaseToken) {
      return { success: false, error: 'Firebase token is required' };
    }

    // Verify Firebase token
    console.log('🔥 [FIREBASE SIGNIN] Verifying Firebase token...');
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      console.log('✅ [FIREBASE SIGNIN] Token verified:', decodedToken.uid);
    } catch (firebaseError) {
      console.error('❌ [FIREBASE SIGNIN] Token verification failed:', firebaseError.message);
      return { success: false, error: 'Invalid or expired Firebase token' };
    }

    const firebaseUid = decodedToken.uid;
    const firebaseEmail = decodedToken.email;

    // Find customer in MySQL
    console.log('🔍 [FIREBASE SIGNIN] Looking up customer in MySQL...');
    const connection = await pool.getConnection();
    const [customers] = await connection.execute(
      'SELECT * FROM customers WHERE firebase_uid = ?',
      [firebaseUid]
    );

    if (customers.length === 0) {
      connection.release();
      console.log('⚠️  [FIREBASE SIGNIN] Customer not found, creating new customer...');

      // Auto-create customer if not exists
      const [result] = await connection.execute(
        `INSERT INTO customers 
         (first_name, last_name, email, firebase_uid, firebase_email, auth_method, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          decodedToken.name?.split(' ')[0] || 'User',
          decodedToken.name?.split(' ')[1] || '',
          firebaseEmail,
          firebaseUid,
          firebaseEmail,
          'firebase',
          'active',
        ]
      );

      const [newCustomer] = await connection.execute(
        'SELECT id, first_name, last_name, email, phone_number, profile_url, date_of_birth, gender, status FROM customers WHERE id = ?',
        [result.insertId]
      );

      connection.release();

      // Generate our JWT token
      const token = jwt.sign(
        { userId: result.insertId, email: firebaseEmail, userType: 'customer' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ [FIREBASE SIGNIN] New customer created and logged in');

      return {
        success: true,
        token,
        user: { ...newCustomer[0], firebase_uid: firebaseUid },
      };
    }

    const customer = customers[0];

    if (customer.status !== 'active') {
      connection.release();
      return { success: false, error: 'Account is not active' };
    }

    connection.release();

    // Generate our JWT token
    const token = jwt.sign(
      { userId: customer.id, email: customer.email, userType: 'customer' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ [FIREBASE SIGNIN] Customer logged in successfully');

    return {
      success: true,
      token,
      user: {
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone_number: customer.phone_number,
        profile_url: customer.profile_url,
        date_of_birth: customer.date_of_birth,
        gender: customer.gender,
        status: customer.status,
        firebase_uid: customer.firebase_uid,
      },
    };
  } catch (error) {
    console.error('❌ [FIREBASE SIGNIN] Error:', error.message);
    return { success: false, error: 'Server error during sign in' };
  }
}

/**
 * Verify Firebase Token (for middleware)
 */
export async function verifyFirebaseToken(token) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Firebase token verification error:', error.message);
    return null;
  }
}
