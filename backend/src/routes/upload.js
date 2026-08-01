const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');
const { uploadToCloudinary } = require('../middleware/upload');

router.post('/', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const sharp = require('sharp');
    const results = await Promise.all(
      req.files.map(async (file) => {
        const processed = await sharp(file.buffer)
          .resize(800, 800, { fit: 'cover', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        const result = await uploadToCloudinary(processed, 'velora');
        return { url: result.secure_url, publicId: result.public_id, alt: file.originalname };
      })
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
