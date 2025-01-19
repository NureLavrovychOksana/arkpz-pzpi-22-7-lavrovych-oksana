const Threat = require('../models/threat');
const IoTData = require("../models/iotdata");

// Constants for normalization and weights
const MAX_TEMP = 100;
const MIN_TEMP = 0;
const MAX_GAS_LEVEL = 1000;
const MAX_HUMIDITY = 100;

const WEIGHT_TEMP = 0.4;
const WEIGHT_GAS = 0.3;
const WEIGHT_SMOKE = 0.2;
const WEIGHT_HUMIDITY = 0.1;

// Function to calculate severity level
function calculateSeverityLevel({ temperature, gas_level, humidity, smoke_detected }) {
  const normTemp = (temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const normGas = gas_level / MAX_GAS_LEVEL;
  const normHumidity = humidity / MAX_HUMIDITY;
  const smokeFactor = smoke_detected ? 1 : 0;

  const severityLevel =
    WEIGHT_TEMP * normTemp +
    WEIGHT_GAS * normGas +
    WEIGHT_SMOKE * smokeFactor +
    WEIGHT_HUMIDITY * normHumidity;

  return Math.min(Math.max(Math.round(severityLevel * 10), 0), 10);
}

// Function to classify threats
function classifyThreat(data) {
  const { temperature, gas_level, humidity, smoke_detected } = data;

  if (temperature > 70 && smoke_detected) {
    return {
      type: 'Fire',
      action: 'Call emergency services and evacuate personnel.',
    };
  } else if (gas_level > 300) {
    return {
      type: 'Gas Leak',
      action: 'Shut off gas supply, ventilate the area, call gas services.',
    };
  } else if (smoke_detected && temperature <= 70) {
    return {
      type: 'Smoke',
      action: 'Ventilate the area, check the source of smoke.',
    };
  } else if (humidity > 90) {
    return {
      type: 'High Humidity',
      action: 'Inspect insulation of electrical equipment and ventilation.',
    };
  } else if (temperature > 50 && temperature <= 70) {
    return {
      type: 'Overheating',
      action: 'Check cooling systems.',
    };
  } else if (temperature > 70 && gas_level > 300) {
    return {
      type: 'Critical Combination',
      action: 'Evacuate personnel immediately, restrict access, call specialized services.',
    };
  } else {
    return null; // No threat detected
  }
}

// Function to process IoT data and create threats
async function processIoTData(iotData) {
  const severityLevel = calculateSeverityLevel(iotData);
  const classification = classifyThreat(iotData);

  if (classification) {
    await Threat.create({
      threat_type: classification.type,
      description: `Threat detected: ${classification.type}.`,
      severity_level: severityLevel,
      recommended_action: classification.action,
      data_id: iotData.id,
    });
    console.log(`Threat created: ${classification.type}`);
  } else {
    console.log('No significant threat detected.');
  }
}

// Simulated IoT data handler
async function handleIoTData(data) {
  try {
    const newIoTData = await IoTData.create(data);
    console.log(`IoT data saved: ${newIoTData.id}`);
    await processIoTData(newIoTData);
  } catch (error) {
    console.error('Error processing IoT data:', error);
  }
}

module.exports = { handleIoTData, processIoTData };