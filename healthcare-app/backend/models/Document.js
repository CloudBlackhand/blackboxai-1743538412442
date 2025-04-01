const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['prescription', 'certificate', 'exam-request'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending-signature', 'signed', 'expired'],
    default: 'draft'
  },
  signatureToken: {
    type: String,
    select: false
  },
  signedAt: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientInfo: {
    name: String,
    cpf: String,
    birthDate: Date
  }
}, { timestamps: true });

// Add index for faster queries
DocumentSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Document', DocumentSchema);