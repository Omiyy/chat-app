const RefreshTokenModel = require('../models/RefreshTokenModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

async function refreshToken(req, res) {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) {
      return res.status(401).json({ message: 'No refresh token provided', error: true });
    }

    const tokenDoc = await RefreshTokenModel.findOne({ token: oldToken });
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Invalid refresh token', error: true });
    }

    if (tokenDoc.isRevoked) {
      // Token theft detected! Revoke all tokens in family
      await RefreshTokenModel.updateMany({ family: tokenDoc.family }, { isRevoked: true });
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(403).json({ message: 'Token theft detected, logged out', error: true });
    }

    // Verify signature
    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET_KEY || 'refresh_secret');
    } catch (e) {
      return res.status(401).json({ message: 'Expired or invalid token signature', error: true });
    }

    // Revoke old token and rotate
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const tokenData = { id: decoded.id, email: decoded.email };
    const newAccessToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY || 'refresh_secret', { expiresIn: '7d' });

    await RefreshTokenModel.create({
      token: newRefreshToken,
      userId: tokenDoc.userId,
      family: tokenDoc.family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const cookieOption = { httpOnly: true, secure: true, sameSite: 'strict' };
    res.cookie('accessToken', newAccessToken, { ...cookieOption, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { ...cookieOption, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ message: 'Token refreshed', success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true });
  }
}

module.exports = refreshToken;
