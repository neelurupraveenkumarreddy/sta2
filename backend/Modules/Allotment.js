const mongoose = require('mongoose');

const AllotmentSchema = new mongoose.Schema({
  exam_datetime: {
    type: Date,
    required: true
  },
  exam_name:{
    type:String,
    required:true
  },
  students_branches: {
    type: [String],
    required: true
  },
  // Now an array of room numbers
  room_no: {
    type: [String],
    required: true
  },
  // Using Map to store multiple 2D arrays keyed by room_number
  allotment: {
    type: Map,
    of: [[String]],
    required: true
  },
  // Map where each key is a room_number and value is an array of unavailable positions
  unavialable_positions: {
    type: Map,
    of: [{
      row: { type: Number, required: true },
      column: { type: Number, required: true }
    }],
    default: {}
  }
}, { timestamps: true });
const allotment = mongoose.model("Allotment", AllotmentSchema)
module.exports = allotment