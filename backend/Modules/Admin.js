const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
      // In production, store a hashed password rather than plaintext
    }
  },
  {
    timestamps: true // Automatically manage createdAt and updatedAt fields
  }
);


const admin = mongoose.model("Admin", AdminSchema)
module.exports = admin