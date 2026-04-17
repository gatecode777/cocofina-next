import mongoose from 'mongoose';

const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired tokens
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ResetToken = mongoose.models.ResetToken || mongoose.model('ResetToken', resetTokenSchema);

export default ResetToken;
// module.exports = mongoose.model('ResetToken', resetTokenSchema); --- IGNORE ---