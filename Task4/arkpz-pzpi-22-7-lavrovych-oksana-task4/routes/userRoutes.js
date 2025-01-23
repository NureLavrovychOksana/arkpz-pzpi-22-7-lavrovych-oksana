'use strict';

const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  toggleUserStatus,
} = require('../services/userService');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const UserRouter = express.Router();
const User = require('../models/user');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API for managing users',
    },
    servers: [
      {
        url: 'http://localhost:4000', // API server
      },
    ],
  },
  apis: ['./src/routes/userRoutes.js'], // Path to the files where the API routes are defined
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Adding Swagger UI
UserRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register a new user
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
UserRouter.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid login credentials
 */
UserRouter.post('/login', async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 */
UserRouter.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a user by ID
/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: User not found
 */
UserRouter.get('/:id', async (req, res) => {
  try {
    const user = await getUserById(Number(req.params.id));
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update user data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Error updating user
 */
UserRouter.put('/:id', async (req, res) => {
  try {
    const user = await updateUser(Number(req.params.id), req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user
/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Error deleting user
 */
UserRouter.delete('/:id', async (req, res) => {
  try {
    await deleteUser(Number(req.params.id));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Middleware для перевірки ролі адміністратора
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Доступ заборонено' });
};

// Ендпоінт для отримання всіх користувачів
router.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
});

// Ендпоінт для активації/деактивації користувача
router.put('/api/admin/users/:id/status', isAdmin, async (req, res) => {
    const userId = req.params.id;
  
    try {
      const updatedUser  = await toggleUserStatus(userId);
      return res.status(200).json({ message: `Статус користувача ${updatedUser.email} змінено на ${updatedUser.status}.` });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

module.exports = UserRouter;

