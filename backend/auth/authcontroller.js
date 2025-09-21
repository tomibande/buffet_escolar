const UserModel = require('../models/usermodel');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, role = 'student' } = req.body;
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists with this email' 
        });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        role
      });
      
      // Generate token
      const token = generateToken(newUser.id);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: { id: newUser.id, username, email, role },
          token
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}

module.exports = AuthController;