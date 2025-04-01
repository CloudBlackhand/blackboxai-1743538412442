const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name']
  },
  cpf: {
    type: String,
    required: [true, 'Please provide CPF'],
    unique: true,
    match: [/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, 'Please provide a valid CPF']
  },
  crm: {
    type: String,
    required: [true, 'Please provide CRM'],
    unique: true
  },
  role: {
    type: String,
    enum: ['healthcare-professional', 'admin'],
    default: 'healthcare-professional'
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);