const mqtt = require('mqtt');
const IoTData = require('./models/iotdata'); // Підключаємо модель IoTData для MySQL

// Підключення до MQTT брокера Mosquitto
const client = mqtt.connect('mqtt://test.mosquitto.org'); // Змінено на Mosquitto

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Підписуємось на тему
  client.subscribe('iot/project/data', (err) => { // Підписка на вашу тему
    if (!err) {
      console.log('Subscribed to topic: iot/project/data');
    } else {
      console.error('Failed to subscribe:', err);
    }
  });
});

client.on('message', async (topic, message) => {
  console.log(`Received message from ${topic}: ${message}`);

  try {
    const data = JSON.parse(message.toString());

    // Встановлюємо базові значення, якщо їх немає в даних
    const temperature = data.temperature || 22.0;  // Якщо температура не задана, використовуємо за замовчуванням 22°C
    const humidity = data.humidity || 50;          // Якщо вологість не задана, використовуємо за замовчуванням 50%
    const gasLevel = data.gas_ppm || 0;            // Якщо рівень газу не заданий, використовуємо 0
    const smokeDetected = data.smoke_ppm || 0;     // Якщо рівень диму не заданий, використовуємо 0

    // Обчислюємо рівень небезпеки (alert_level)
    const alertLevel = calculateAlertLevel({ temperature, humidity, gas_ppm: gasLevel, smoke_ppm: smokeDetected });

    // Збереження даних в базу даних MySQL
    await IoTData.create({
      temperature: temperature,
      humidity: humidity,
      gas_level: gasLevel,
      smoke_detected: smokeDetected > 30, // Якщо рівень диму перевищує 30, вважаємо це за наявність диму
      alert_level: alertLevel,
      location_id: 4,
    });

    console.log('Data saved to MySQL database:', { temperature, humidity, gasLevel, smokeDetected });
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

function calculateAlertLevel(data) {
  let level = 0;

  if (data.temperature > 50) level += 2; // Висока температура
  if (data.humidity > 80) level += 1;    // Висока вологість
  if (data.gas_ppm > 100) level += 3;   // Високий рівень газу
  if (data.smoke_ppm > 30) level += 2;  // Дим перевищує допустимий рівень

  return Math.min(level, 5); // Максимальний рівень небезпеки - 5
}
