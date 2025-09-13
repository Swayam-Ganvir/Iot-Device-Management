import mqtt from "mqtt";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MQTT broker using environment variable
const client = mqtt.connect(process.env.MQTT_BROKER_URL);

// Helper: encode float -> little-endian int
function encodeFloatToLittleEndian(value) {
  const buf = Buffer.alloc(4);
  buf.writeFloatLE(value, 0);
  return buf.readUInt32LE(0);
}

// Simulated devices
const devices = [
  { uid: "dev-1001", fw: "1.0.0" },
  { uid: "dev-1002", fw: "1.0.0" },
  { uid: "dev-1003", fw: "1.0.0" },
];

client.on("connect", () => {
  console.log("Simulator connected to MQTT broker");

  setInterval(() => {
    devices.forEach((device) => {
      // Generate random but realistic values
      const temp = 20 + Math.random() * 10; // 20–30 °C
      const hum = 40 + Math.random() * 20; // 40–60 %
      const pm25 = 5 + Math.random() * 10; // 5–15 µg/m³

      // Encode to little-endian integers
      const payload = {
        uid: device.uid,
        fw: device.fw,
        tts: Math.floor(Date.now() / 1000),
        data: {
          temp: encodeFloatToLittleEndian(temp),
          hum: encodeFloatToLittleEndian(hum),
          "pm2.5": encodeFloatToLittleEndian(pm25),
        },
      };

      // Publish message
      client.publish(`/application/out/${device.uid}`, JSON.stringify(payload));
      console.log(`Published data for ${device.uid}:`, {
        temp: temp.toFixed(2),
        hum: hum.toFixed(2),
        pm25: pm25.toFixed(2),
      });
    });
  }, 5000); // publish every 5 seconds
});

client.on("error", (err) => {
  console.error("MQTT connection failed:", err);
});
