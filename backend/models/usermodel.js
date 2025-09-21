// Mock database operations - replace with actual database implementation
class UserModel {
  static users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@school.edu',
      password: '$2a$10$example.hash.here',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  static async findAll() {
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  static async findById(id) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static async findByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  static async create(userData) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async update(id, updateData) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      updated_at: new Date()
    };

    const { password, ...userWithoutPassword } = this.users[userIndex];
    return userWithoutPassword;
  }

  static async delete(id) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}

module.exports = UserModel;