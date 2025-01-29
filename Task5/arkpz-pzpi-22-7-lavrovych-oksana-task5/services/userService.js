const bcrypt = require('bcrypt');
const User = require('../models/user');

const createUser  = async (userData) => {
    // Хешування пароля
    const saltRounds = 10; // Кількість раундів для хешування
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
  
    // Створення користувача з хешованим паролем
    return await User.create({
      ...userData,
      password_hash: passwordHash, // Зберігаємо хешований пароль
      password: undefined // Видаляємо оригінальний пароль з об'єкта
    });
  };
const getAllUsers = async () => {
  return await User.findAll();
};

const getUserById = async (id) => {
  return await User.findByPk(id);
};

const updateUser = async (id, updates) => {
  const user = await User.findByPk(id);
  if (user) {
    return await user.update(updates);
  }
  throw new Error('User not found');
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (user) {
    await user.destroy();
    return true;
  }
  throw new Error('User not found');
};

const loginUser = async (email, password) => {
  // Знайти користувача за email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // Перевірити пароль
  const isPasswordValid = await bcrypt.compare(password, user.get('password_hash'));
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return user;
};

const registerUser = async (userData) => {
    const saltRounds = 10;
    // Перевірка, чи користувач із такою поштою вже існує
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  
    // Хешування пароля
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
  
    // Створення нового користувача з хешованим паролем
    const user = await User.create({
      ...userData,
      password_hash: hashedPassword, // Замість пароля зберігаємо хеш
    });
  
    return user;
  };

  const toggleUserStatus = async (userId) => {
    try {
      // Знаходимо користувача за ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Користувача не знайдено.');
      }
  
      // Змінюємо статус на протилежний
      user.status = user.status === 'active' ? 'inactive' : 'active';
      await user.save();
  
      // Повертаємо оновленого користувача
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Не вдалося змінити статус користувача.');
    }
  };

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  toggleUserStatus,
};
