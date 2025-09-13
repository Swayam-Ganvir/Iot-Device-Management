import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema({

    device: { type: mongoose.Schema.Types.ObjectId, ref: "Devices", required: true },

    temp: { type: Number },

    hum: { type: Number },

    pm25: { type: Number },

    deviceTimestamp: { type: Number },

    serverTimestamp: { type: Date, default: Date.now }

})

const Telemetry = mongoose.model('Telemetry', telemetrySchema)

export default Telemetry;
