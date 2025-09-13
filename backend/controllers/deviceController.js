import Devices from "../model/deviceSchema.js";
import Telemetry from "../model/telemetrySchema.js";

export const getDevices = async (req, res) => {
    try {

        const devices = await Devices.find({});

        return res.json(devices)

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// CREATE telemetry + emit real-time
export const createTelemetry = async (req, res) => {
  try {
    const { deviceId, temp, hum, pm25 } = req.body; 

    const device = await Devices.findOne({ uid: deviceId });
    if (!device) {
      return res.status(404).json({ message: "Device not registered" });
    }

    const newReading = new Telemetry({
      device: device._id,
      temp,
      hum,
      pm25,
      deviceTimestamp: Math.floor(Date.now() / 1000),
    });

    await newReading.save();
    const dataToEmit = await newReading.populate("device");

    // Emit to socket listeners
    if (req.io) {
      req.io.to(device.uid).emit("new-telemetry-data", dataToEmit);
      console.log("📡 Emitted new data for device:", device.uid);
    }

    return res.status(201).json({ message: "Data received", data: newReading });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET last 10 readings for a device
export const getDeviceData = async (req, res) => {
  try {
    const { id } = req.params; // device uid
    const device = await Devices.findOne({ uid: id });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const readings = await Telemetry.find({ device: device._id })
      .sort({ serverTimestamp: -1 })
      .limit(10);

    return res.json({
      device,
      readings,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

