const Chapter = require('../models/Chapter');
const { invalidateChaptersCache } = require('../middlewares/cache');

/**
 * Get all chapters with filtering and pagination
 * @route GET /api/v1/chapters
 */
const getAllChapters = async (req, res, next) => {
  try {
    // Extract query parameters
    const { 
      class: className, 
      unit, 
      status, 
      weakChapters, 
      subject,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (className) filter.class = className;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (weakChapters === 'true') filter.isWeakChapter = true;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const chapters = await Chapter.find(filter)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const totalChapters = await Chapter.countDocuments(filter);
    
    // Send response
    res.status(200).json({
      success: true,
      count: chapters.length,
      totalChapters,
      totalPages: Math.ceil(totalChapters / limitNum),
      currentPage: pageNum,
      data: chapters
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single chapter by ID
 * @route GET /api/v1/chapters/:id
 */
const getChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload chapters from JSON file
 * @route POST /api/v1/chapters
 */
const uploadChapters = async (req, res, next) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a JSON file'
      });
    }
    
    // Parse JSON data from file
    let chaptersData;
    try {
      const fileContent = req.file.buffer.toString();
      chaptersData = JSON.parse(fileContent);
      
      // Ensure data is an array
      if (!Array.isArray(chaptersData)) {
        chaptersData = [chaptersData];
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format',
        error: parseError.message
      });
    }
    
    // Process each chapter
    const results = {
      success: [],
      failed: []
    };
    
    for (const chapterData of chaptersData) {
      try {
        // Create new chapter
        const chapter = new Chapter(chapterData);
        await chapter.validate(); // Validate before saving
        await chapter.save();
        results.success.push({
          id: chapter._id,
          chapter: chapter.chapter
        });
      } catch (validationError) {
        results.failed.push({
          chapter: chapterData.chapter || 'Unknown',
          error: validationError.message
        });
      }
    }
    
    // Invalidate cache after adding new chapters
    const redisClient = req.app.locals.redisClient;
    if (redisClient && results.success.length > 0) {
      await invalidateChaptersCache(redisClient);
    }
    
    // Send response
    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${results.success.length} chapters, ${results.failed.length} failed`,
      successCount: results.success.length,
      failedCount: results.failed.length,
      successfulChapters: results.success,
      failedChapters: results.failed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChapters,
  getChapter,
  uploadChapters
}; 