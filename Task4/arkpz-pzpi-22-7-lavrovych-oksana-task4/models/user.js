const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notification_type: {
      type: DataTypes.ENUM('SMS', 'Email', 'Both'),
      defaultValue: 'Email',
    },
    user_type: {
      type: DataTypes.ENUM('standard', 'admin'),
      defaultValue: 'standard',
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active', // Встановлюємо статус за замовчуванням на 'active'
      },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: false,
  }
);

module.exports = User;
