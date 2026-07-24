const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  family: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false }
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshTokenModel;
