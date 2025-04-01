const mongoose = require("mongoose")
const roomsSchema = new mongoose.Schema({
  room_number: {
    type: String,
    required: true
  },
  rows: {
    type: Number,
    required: true
  },
  columns: {
    type: Number,
    required: true
  },
  building_name: {
    type: String,
    required: true
  },
  unavialable_positions: [{
    row: { type: Number, required: true },
    column: { type: Number, required: true }
  }]
}, { timestamps: true });
const room = mongoose.model("Room", roomsSchema)
module.exports = room