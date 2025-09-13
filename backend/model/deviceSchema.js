import mongoose from "mongoose"

const deviceSchema = new mongoose.Schema({

    uid: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type : String,
        required : true
    },

    fw : {
        type : String
    },

    latestReading : {
        temp : Number,
        hum : Number,
        pm25 : Number,
        timestamp : Date,
    },
    lastUpdated: { type: Date, default: Date.now },
    createdAt : {type : Date, default : Date.now}

})

const Devices = mongoose.model('Devices', deviceSchema)

export default Devices;
