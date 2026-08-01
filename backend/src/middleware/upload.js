const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const processImage = async (buffer, options = {}) => {
  const { width = 800, height = 800, quality = 80, format = 'webp' } = options;
  return sharp(buffer)
    .resize(width, height, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
};

const uploadToCloudinary = (buffer, folder = 'velora') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();

    const uploadPromises = req.files.map(async (file) => {
      const mainBuffer = await processImage(file.buffer, { width: 800, quality: 80 });
      const thumbBuffer = await processImage(file.buffer, { width: 400, quality: 70 });

      const [mainResult, thumbResult] = await Promise.all([
        uploadToCloudinary(mainBuffer, 'velora/products'),
        uploadToCloudinary(thumbBuffer, 'velora/products/thumbs'),
      ]);

      return {
        url: mainResult.secure_url,
        thumbnail: thumbResult.secure_url,
        alt: file.originalname,
        publicId: mainResult.public_id,
      };
    });

    req.uploadedImages = await Promise.all(uploadPromises);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImage, uploadToCloudinary, uploadProductImages };
