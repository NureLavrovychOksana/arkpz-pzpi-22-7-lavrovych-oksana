const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc'); // Importing Swagger JSdoc
const swaggerUi = require('swagger-ui-express'); // Importing Swagger UI Express
const sequelize = require('./db'); // Імпортуємо sequelize для підключення до бази даних
const userRouter = require('./routes/userRoutes'); // Імпортуємо роутер для користувачів
const userAlertRouter = require('./routes/userAlertRoutes'); // Імпортуємо роутер для сповіщень користувачів
const alertRouter = require('./routes/alertRoutes'); // Імпортуємо роутер для сповіщень
const threatRouter = require('./routes/threatRoutes'); // Імпортуємо роутер для загроз
const locationRouter = require('./routes/locationRoutes'); // Імпортуємо роутер для локацій
const IotDataRouter = require('./routes/IoTDataRoutes');

const app = express();
const port = 3000; // Встановлюємо порт для сервера

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for managing users, alerts, and more',
    },
    servers: [
      {
        url: `http://localhost:${port}`, // Server URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Налаштовуємо middleware
app.use(cors());
app.use(bodyParser.json()); // Для парсингу JSON даних з запитів

// Використовуємо роутери для обробки запитів
app.use(userRouter);
app.use(userAlertRouter);
app.use(alertRouter);
app.use(threatRouter);
app.use(locationRouter);
app.use(IotDataRouter);

// Синхронізація бази даних та запуск сервера
(async () => {
  try {
    // Перевіряємо з'єднання з базою даних
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Запуск сервера
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting the server or syncing the database:', error);
  }
})();
