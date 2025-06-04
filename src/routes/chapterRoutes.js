const express = require('express');
const multer = require('multer');
const { getAllChapters, getChapter, uploadChapters } = require('../controllers/chapterController');
const { isAdmin } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only JSON files
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

// Routes
// GET all chapters with cache middleware (1 hour cache)
router.get('/', cacheMiddleware(3600), getAllChapters);

// GET single chapter by ID
router.get('/:id', getChapter);

// POST upload chapters (admin only)
router.post('/', isAdmin, upload.single('chapters'), uploadChapters);

module.exports = router; 