const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 40,
    default: ""
  },
  company: {
    type: String,
    trim: true,
    maxlength: 160,
    default: ""
  },
  reason: {
    type: String,
    required: true,
    enum: [
      "Job Opportunity",
      "Freelance / Project",
      "Internship",
      "Collaboration",
      "Other"
    ]
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports =
  mongoose.models.Contact ||
  mongoose.model("Contact", contactSchema);