const UserModel = require('../../models/usermodel');
const { hashPassword, comparePassword } = require('../../utils/helpers');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      
      const updatedUser = await UserModel.update(id, updateData);
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await UserModel.delete(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = UserController;