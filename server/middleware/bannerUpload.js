import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure banner upload directory
const isProduction = process.env.NODE_ENV === 'production';
const uploadDir = isProduction
  ? '/home/canzey/admin.canzey.com/uploads/banners/'
  : path.join(__dirname, '../uploads/banners/');

// Create the banners directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created banners upload directory:', uploadDir);
}

// Configure storage for banners
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: banner-timestamp-random.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for banner uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for banner images
  },
  fileFilter: fileFilter
});

export default upload;
