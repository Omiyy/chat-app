const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded', error: true });
    }

    // Determine resource type based on mime type
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'chat_app_uploads',
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Upload failed', error: true });
        }
        
        return res.status(200).json({
          url: result.secure_url,
          format: result.format,
          resource_type: result.resource_type,
          success: true
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ message: error.message, error: true });
  }
}

module.exports = uploadFile;
