const mqtt = require('mqtt');
const IoTData = require('./models/iotdata'); // Підключаємо модель IoTData

// Підключення до MQTT брокера
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Підписуємось на тему
  client.subscribe('iot/data', (err) => {
    if (!err) {
      console.log('Subscribed to topic: iot/data');
    } else {
      console.error('Failed to subscribe:', err);
    }
  });
});

client.on('message', async (topic, message) => {
  console.log(`Received message from ${topic}: ${message}`);

  try {
    const data = JSON.parse(message.toString());

    // Обчислюємо рівень небезпеки (alert_level)
    const alertLevel = calculateAlertLevel(data);

    await IoTData.create({
      temperature: data.temperature,
      humidity: data.humidity,
      gas_level: data.gas_ppm,
      smoke_detected: data.smoke_ppm > 30,
      alert_level: alertLevel,
      location_id: 1,
    });

    console.log('Data saved to database:', data);
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
