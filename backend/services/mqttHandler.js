import mqtt from "mqtt";
import Devices from "../model/deviceSchema.js";
import Telemetry from "../model/telemetrySchema.js";

// Helper function to decode the telemetry data
function decodeLittleEndianFloat(intValue) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(intValue, 0);
  return parseFloat(buf.readFloatLE(0).toFixed(2));
}

export const initializeMqttListener = (io) => {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL);

  client.on("connect", () => {
    console.log("MQTT Client connected and subscribing to /application/out/+");
    client.subscribe("/application/out/+");
  });

  client.on("message", async (topic, message) => {
    try {
      const raw = JSON.parse(message.toString());
      const deviceUid = raw.uid;

      if (!deviceUid) {
        console.warn("Received MQTT message without a UID. Skipping.");
        return;
      }
      
      let device = await Devices.findOne({ uid: deviceUid });
      if (!device) {
        device = new Devices({
          uid: deviceUid,
          name: `Device-${deviceUid}`,
          firmware: raw.fw,
        });
        await device.save();
        console.log(`✅ New device created: ${device.uid}`);
      }

      const decodedData = {
        temp: decodeLittleEndianFloat(raw.data.temp),
        hum: decodeLittleEndianFloat(raw.data.hum),
        pm25: decodeLittleEndianFloat(raw.data["pm2.5"]),
      };

      const telemetry = new Telemetry({
        device: device._id,
        ...decodedData,
        deviceTimestamp: raw.tts,
      });
      await telemetry.save();

      const dataToEmit = await telemetry.populate('device');
      
      // 1. Emit to the specific room for the modal
      io.to(deviceUid).emit("new-telemetry-data", dataToEmit);
      
      // 2. Emit a general event for the main dashboard table
      io.emit("latest-device-update", dataToEmit);

      console.log(`Emitted new data for device: ${deviceUid}`);

    } catch (err) {
      console.error("Error processing MQTT message:", err.message);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT Connection Error:", err);
  });
};

