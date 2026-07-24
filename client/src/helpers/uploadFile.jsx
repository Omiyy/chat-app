import api from './axios'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

const uploadFile = async (file) => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
  }

  // Validate file type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
  if (!isImage && !isVideo) {
    throw new Error('Unsupported file type. Please upload an image or video.')
  }

  // Fetch ONLY the signature, timestamp, and folder from backend
  const sigResponse = await api.post('/api/upload/signature');
  const { signature, timestamp, folder } = sigResponse.data;

  // Read Cloudinary config from frontend .env
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    throw new Error('Upload service is not fully configured in client/.env.')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', signature)
  formData.append('timestamp', timestamp)
  formData.append('api_key', apiKey)
  formData.append('folder', folder)

  const response = await fetch(url, {
    method: 'post',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed. Please try again.')
  }

  const responseData = await response.json()
  return responseData
}

export default uploadFile