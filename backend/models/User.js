const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://i.pravatar.cc/150?u=placeholder' },
  preferences: {
    theme: { type: String, enum: ['classic', 'modern-light', 'glass-dark', 'dark'], default: 'classic' },
    currency: { type: String, default: 'INR' },
    emailNotif: { type: Boolean, default: true },
    pushNotif: { type: Boolean, default: false },
    budgetAlerts: { type: Boolean, default: true },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    language: { type: String, default: 'en' },
    monthlyBudget: { type: Number, default: null }
  },
  occupation: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { timestamps: true });

// Indexes for performance optimization
userSchema.index({ email: 1 }); // Already unique, but explicit index for faster lookups
userSchema.index({ createdAt: -1 }); // For sorting by creation date

userSchema.pre('save', async function () {
  if (this.isModified('preferences.theme') || !this.preferences.theme) {
    const oldThemes = ['light', 'dark', 'modern-glass'];
    if (oldThemes.includes(this.preferences.theme)) {
      if (this.preferences.theme === 'modern-glass') {
        this.preferences.theme = 'glass-dark';
      } else {
        this.preferences.theme = 'classic';
      }
    }
    const validThemes = ['classic', 'modern-light', 'glass-dark', 'dark'];
    if (!validThemes.includes(this.preferences.theme)) {
      this.preferences.theme = 'classic';
    }
  }
  
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
