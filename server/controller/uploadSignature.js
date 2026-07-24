const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function getSignature(req, res) {
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const folder = 'chat_app_uploads';
    
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder
    }, process.env.CLOUDINARY_API_SECRET);

    // ONLY sending the signature, timestamp, and folder. 
    // We are NOT sending the apiKey or cloudName!
    return res.status(200).json({
      timestamp,
      signature,
      folder,
      success: true
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true });
  }
}

module.exports = getSignature;
